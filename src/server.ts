import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import { z } from 'zod';
import config from './config';
import { routeRequest, queryChessAgent, queryReasoningModel, queryChessReasoningModel, queryGeneralAgent, queryGrokAgent } from './services/llm-router';
import { taskQueue } from './workflows/queue';
import './workflows/orchestrator'; // Auto-starts background worker
import multipart from '@fastify/multipart';
import { extractPdfPayload } from './services/pdf-service';
import fs from 'fs';
import path from 'path';
import { LocalCADClient } from './mcp/cad/local-cad-client';

const localCADClient = new LocalCADClient();

// Initialize Fastify
const app: FastifyInstance = Fastify({
    logger: true,
    connectionTimeout: 300000, // 5 mins
    keepAliveTimeout: 300000,
    bodyLimit: 52428800 // 50MB (Allows large base64 image strings)
});

// Enable CORS
app.register(cors, {
    origin: '*',
});

// Enable Multipart limits (50MB)
app.register(multipart, {
    limits: {
        fileSize: 52428800
    }
});

// Register static file serving for models
app.register(staticFiles, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/', // Allow /models/xxx.json
});

// Input Validation Schema
const askBodySchema = z.object({
    prompt: z.string().min(1, "Prompt cannot be empty"),
});

const agentBodySchema = z.object({
    messages: z.array(z.any()),
    tools: z.array(z.any()).optional(),
    prompt: z.string().optional()
});

// Endpoint: POST /agent (General Agent with Tool Calling)
app.post('/agent', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[API] /agent Request Body received (structured payload)');
        const payload = agentBodySchema.parse(request.body);

        const result = await queryGeneralAgent(payload.messages, payload.tools);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                success: false,
                error: "Validation Error",
                details: error.errors,
            });
        }
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Endpoint: POST /agent-neo (Grok xAI Agent with Tool Calling)
app.post('/agent-neo', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[API] /agent-neo Request Body received (structured payload for Grok)');
        const payload = agentBodySchema.parse(request.body);

        const result = await queryGrokAgent(payload.messages, payload.tools);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                success: false,
                error: "Validation Error",
                details: error.errors,
            });
        }
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Endpoint: POST /upload (Handles raw binary attachments like PDFs to prevent frontend base64 crashes)
app.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const files = request.files();
        const results = [];

        for await (const part of files) {
            const buffer = await part.toBuffer();

            // Save ALL files to disk so MCP tools can access them by path later
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Generate a safe unique filename to prevent overwrites
            const safeName = `${Date.now()}-${part.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const savePath = path.join(uploadsDir, safeName);
            fs.writeFileSync(savePath, buffer);
            const serverPath = `uploads/${safeName}`; // Relative path for MCP tools

            console.log(`[API] /upload Saved file to: ${savePath}`);

            if (part.mimetype === 'application/pdf') {
                console.log(`[API] /upload Processing PDF for text: ${part.filename} (${buffer.length} bytes)`);
                const pdfData = await extractPdfPayload(buffer);
                results.push({
                    filename: part.filename,
                    serverPath, // Expose relative server path for MCP tool usage
                    mimeType: part.mimetype,
                    extractedText: pdfData.text,
                    images: pdfData.images,
                    isScanned: pdfData.isScanned
                });
            } else {
                // Return path + Base64 fallback for other non-PDF files
                results.push({
                    filename: part.filename,
                    serverPath, // Expose relative server path for MCP tool usage
                    mimeType: part.mimetype,
                    base64Data: buffer.toString('base64')
                });
            }
        }

        return reply.status(200).send({
            success: true,
            data: results
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Failed to process upload"
        });
    }
});

// Endpoint: POST /library/generate (Direct parametric generation for Dashboard)
app.post('/library/generate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const schema = z.object({
            type: z.enum(['bolt', 'nut', 'gear', 'tube', 'tube2d', 'shopping-cart', 'go-cart', 'bottle', 'scooter']),
            parameters: z.any()
        });
        const { type, parameters } = schema.parse(request.body);

        let result;
        if (type === 'bolt') {
            result = await localCADClient.createBolt(parameters);
        } else if (type === 'nut') {
            result = await localCADClient.createNut(parameters);
        } else if (type === 'gear') {
            result = await localCADClient.createGear(parameters);
        } else if (type === 'tube') {
            result = await localCADClient.createTube(parameters);
        } else if (type === 'tube2d') {
            result = await localCADClient.createTube2D(parameters);
        } else if (type === 'shopping-cart') {
            result = await localCADClient.createShoppingCart(parameters);
        } else if (type === 'go-cart') {
            result = await localCADClient.createGoCart(parameters);
        } else if (type === 'bottle') {
            result = await localCADClient.createBottle(parameters);
        } else if (type === 'scooter') {
            result = await localCADClient.createScooter(parameters);
        } else {
            throw new Error("Invalid part type");
        }

        return reply.status(200).send({
            success: true,
            ...result
        });
    } catch (error: any) {
        return reply.status(400).send({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: POST /custom/save (Save custom sketch/extrusion model)
app.post('/custom/save', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const schema = z.object({
            id: z.string(),
            name: z.string(),
            operations: z.array(z.any())
        });
        const { id, name, operations } = schema.parse(request.body);

        const result = await localCADClient.createCustomModel(id, name, operations);

        return reply.status(200).send({
            success: true,
            ...result
        });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({
            success: false,
            error: error.message
        });
    }
});
app.get('/cad-models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const modelsDir = path.join(process.cwd(), 'public', 'models');
        if (!fs.existsSync(modelsDir)) {
            return reply.status(200).send({ success: true, models: [] });
        }

        const files = fs.readdirSync(modelsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        const models = jsonFiles.map(file => {
            const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
            try {
                const data = JSON.parse(content);
                return {
                    id: file.replace('.json', ''),
                    ...data
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return reply.status(200).send({
            success: true,
            models
        });
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Failed to list models"
        });
    }
});

// Endpoint: POST /ask (General Purpose)
app.post('/ask', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { prompt } = askBodySchema.parse(request.body);

        const result = await routeRequest(prompt);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                success: false,
                error: "Validation Error",
                details: error.errors,
            });
        }

        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Endpoint: POST /tasks (Add new background task)
app.post('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const schema = z.object({
            description: z.string().min(1, "Description cannot be empty"),
            level: z.number().optional().default(0)
        });
        const { description, level } = schema.parse(request.body);
        const id = taskQueue.addTask(description, level);
        return reply.status(200).send({ success: true, id });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ success: false, error: "Validation Error", details: error.errors });
        }
        return reply.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Endpoint: GET /tasks (List all tasks)
app.get('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ success: true, tasks: taskQueue.getAllTasks() });
});

// Endpoint: POST /tasks/:id/respond (Provide human answer to BLOCKED task)
app.post('/tasks/:id/respond', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const schema = z.object({
            response: z.string().min(1, "Response cannot be empty")
        });
        const { id } = request.params;
        const { response } = schema.parse(request.body);

        const success = taskQueue.provideHumanResponse(id, response);
        if (success) {
            return reply.status(200).send({ success: true });
        } else {
            return reply.status(404).send({ success: false, error: "Task not found or not BLOCKED" });
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ success: false, error: "Validation Error", details: error.errors });
        }
        return reply.status(500).send({ success: false, error: "Internal Server Error" });
    }
});
// Endpoint: POST /tasks/:id/retry (Retry a FAILED task)
app.post('/tasks/:id/retry', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const success = taskQueue.retryTask(id);
        if (success) {
            return reply.status(200).send({ success: true });
        } else {
            return reply.status(404).send({ success: false, error: "Task not found or not in FAILED state" });
        }
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: "Internal Server Error" });
    }
});

// Endpoint: POST /chess (Specialized Agent Logic - Llama3)
app.post('/chess', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[API] /chess Request Body:', JSON.stringify(request.body, null, 2));
        const { prompt } = askBodySchema.parse(request.body);

        // Call the specialized chess agent logic
        const result = await queryChessAgent(prompt);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({
                success: false,
                error: "Validation Error",
                details: error.errors,
            });
        }
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Endpoint: POST /reason (Deepseek R1 - General Reasoning)
app.post('/reason', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[API] /reason Request Body:', JSON.stringify(request.body, null, 2));
        const { prompt } = askBodySchema.parse(request.body);

        const result = await queryReasoningModel(prompt);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Endpoint: POST /chess-reason (Deepseek R1 - Chess Agent)
app.post('/chess-reason', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log('[API] /chess-reason Request Body:', JSON.stringify(request.body, null, 2));
        const { prompt } = askBodySchema.parse(request.body);

        const result = await queryChessReasoningModel(prompt);

        return reply.status(200).send({
            success: true,
            data: result,
        });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// ============================================================================
// MCP Server Integration
// ============================================================================
import { createServer, SSEServerTransport } from './mcp/server';
import crypto from 'crypto';

// Map of sessionId -> { transport, server, ids }
const activeConnections = new Map<string, { transport: SSEServerTransport, server: any, ids: Set<string> }>();

app.get('/mcp/sse', async (request: FastifyRequest, reply: FastifyReply) => {
    // Priority 1: Honor the sessionId if the client already choose one (common for agent-neo)
    // Priority 2: Fallback to a fresh UUID
    const sessionId = (request.query as any).sessionId || crypto.randomUUID();
    console.log(`[MCP] SSE Connection Attempt. Target Session: ${sessionId}`);

    // Hijack the underlying raw socket to prevent Fastify from eagerly closing it
    reply.hijack();

    // Manually inject CORS headers into the raw response because SSEServerTransport hardcodes its own
    const rawRes = reply.raw;
    const originalWriteHead = rawRes.writeHead.bind(rawRes);
    (rawRes as any).writeHead = (statusCode: number, statusMessage?: any, headers?: any) => {
        // Handle both (statusCode, headers) and (statusCode, statusMessage, headers) signatures
        let finalHeaders = typeof statusMessage === 'object' ? statusMessage : headers;
        finalHeaders = {
            ...finalHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        if (typeof statusMessage === 'string') {
            return originalWriteHead(statusCode, statusMessage, finalHeaders);
        } else {
            return originalWriteHead(statusCode, finalHeaders);
        }
    };

    // Create a new Transport and Server instance for this specific client
    // CRITICAL: We use an absolute URL for the message endpoint to prevent cross-domain resolution errors
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const host = request.headers.host;
    const absoluteEndpoint = `${protocol}://${host}/mcp/message?sessionId=${sessionId}`;

    console.log(`[MCP] Sending absolute endpoint: ${absoluteEndpoint}`);
    const transport = new SSEServerTransport(absoluteEndpoint, rawRes as any);
    const serverInstance = createServer();

    // Store metadata to handle cleanup of multiple aliases
    const sessionData = { transport, server: serverInstance, ids: new Set([sessionId]) };
    activeConnections.set(sessionId, sessionData);
    console.log(`[MCP] [DEBUG] Session ${sessionId} mapped. Total active sessions: ${activeConnections.size}`);

    try {
        await serverInstance.connect(transport);
        console.log(`[MCP] [DEBUG] Session ${sessionId} fully connected to transport.`);
    } catch (err: any) {
        console.error(`[MCP] [CRITICAL] Failed to connect server for session ${sessionId}:`, err);
        activeConnections.delete(sessionId);
    }

    // Keep-alive heartbeat to prevent reverse proxies (e.g., Railway, NGINX) from terminating idle connections
    const keepAlive = setInterval(() => {
        try {
            reply.raw.write(':\n\n');
        } catch (e) {
            clearInterval(keepAlive);
        }
    }, 15000);

    // If the client disconnects, clean up this specific session after a small grace period
    request.raw.on('close', () => {
        console.log(`[MCP] Client connection closed (socket): ${sessionId}`);
        clearInterval(keepAlive);

        // We wait 3 seconds before deleting to handle rapid reconnects or POST/SSE race conditions
        setTimeout(() => {
            const data = activeConnections.get(sessionId);
            if (data) {
                console.log(`[MCP] Cleaning up session and its aliases: ${Array.from(data.ids).join(', ')}`);
                data.server.close().catch((err: any) => console.error(`[MCP] Error closing server:`, err));
                // Remove all IDs pointing to this session
                for (const id of data.ids) {
                    activeConnections.delete(id);
                }
            }
        }, 3000);
    });
});

app.post('/mcp/message', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = (request.query as any).sessionId;
    const body = request.body as any;

    console.log(`[MCP] [DEBUG] Incoming POST for Session: [${sessionId}] (Size: ${JSON.stringify(body).length} bytes)`);

    let session = activeConnections.get(sessionId);

    // SELF-HEALING LOGIC:
    // If the session is missing, but there is exactly ONE active connection, 
    // we "adopt" this new sessionId for that connection. 
    // This solves the issue where the client chooses its own ID for POST but uses ours for SSE.
    if (!session && activeConnections.size === 1) {
        const onlySessionId = activeConnections.keys().next().value as string;
        const onlySession = activeConnections.get(onlySessionId)!;
        console.log(`[MCP] [HEAL] Mapping orphan POST session [${sessionId}] to active SSE session [${onlySessionId}]`);
        onlySession.ids.add(sessionId as string); // Track alias
        activeConnections.set(sessionId as string, onlySession);
        session = onlySession;
    }

    // NEW FALLBACK: If multiple connections exist, but we have an un-aliased connection 
    // that was just created recently, map to it. We just grab the last added connection.
    if (!session && activeConnections.size > 0) {
        const fallbackSessionId = Array.from(activeConnections.keys()).pop() as string;
        const fallbackSession = activeConnections.get(fallbackSessionId)!;
        console.log(`[MCP] [HEAL-MULTIPLE] Mapping orphan POST session [${sessionId}] to latest SSE session [${fallbackSessionId}]`);
        fallbackSession.ids.add(sessionId as string);
        activeConnections.set(sessionId as string, fallbackSession);
        session = fallbackSession;
    }

    if (!session) {
        console.error(`[MCP] [404] Session ${sessionId} NOT FOUND in map.`);
        console.log(`[MCP] [VERBOSE] Known Sessions in memory: [${Array.from(activeConnections.keys()).join(', ')}]`);
        console.log(`[MCP] [VERBOSE] Body Snippet: ${JSON.stringify(body).slice(0, 200)}`);
        return reply.status(404).send({ error: "Session not found or expired" });
    }

    try {
        // Fastify already parsed the body, so we use handleMessage directly.
        // This is more stable than handlePostMessage which tries to re-parse the raw stream.
        await session.transport.handleMessage(body);
        return reply.status(202).send("Accepted");
    } catch (err: any) {
        console.error(`[MCP] [ERROR] Failed to handle message for session ${sessionId}:`, err);
        return reply.status(500).send({ error: "Failed to process message" });
    }
});

import archiver from 'archiver';

// Endpoint: POST /download (Zips a requested directory and streams it back)
app.post('/download', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = request.body as { directoryPath: string };
        const dirPath = body?.directoryPath;

        if (!dirPath || typeof dirPath !== 'string') {
            return reply.status(400).send({ success: false, error: "directoryPath is required" });
        }

        const absolutePath = path.resolve(dirPath);

        if (!fs.existsSync(absolutePath)) {
            return reply.status(404).send({ success: false, error: "Directory not found on server" });
        }

        // Set headers for file download
        reply.header('Content-Type', 'application/zip');
        reply.header('Content-Disposition', `attachment; filename="${path.basename(absolutePath)}.zip"`);

        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        archive.on('error', function (err) {
            throw err;
        });

        // Pipe archive data to the fastify reply stream
        reply.send(archive);

        // Append files from the directory, ignoring node_modules
        archive.glob('**/*', { cwd: absolutePath, ignore: ['node_modules/**'] });

        // Finalize the archive (we are done appending files and it will finish the stream)
        archive.finalize();

        // Fastify automatically handles the streaming reply
        return reply;

    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
    }
});

// Endpoint: POST /download-file (Streams a single specific file for download)
app.post('/download-file', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = request.body as { filePath: string };
        const reqPath = body?.filePath;

        if (!reqPath || typeof reqPath !== 'string') {
            return reply.status(400).send({ success: false, error: "filePath is required" });
        }

        // The user might send a full file:// URI or an absolute path. Clean it up.
        let cleanPath = reqPath;
        if (cleanPath.startsWith('file://')) {
            cleanPath = cleanPath.replace('file://', '');
        }

        const absolutePath = path.resolve(cleanPath);

        if (!fs.existsSync(absolutePath)) {
            return reply.status(404).send({ success: false, error: "File not found on server" });
        }

        const stat = fs.statSync(absolutePath);
        if (!stat.isFile()) {
            return reply.status(400).send({ success: false, error: "Path does not point to a file" });
        }

        const fileName = path.basename(absolutePath);
        let mimeType = 'application/octet-stream';
        if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
        if (fileName.endsWith('.png')) mimeType = 'image/png';
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';

        reply.header('Content-Type', mimeType);
        reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
        reply.header('Content-Length', stat.size.toString());

        const stream = fs.createReadStream(absolutePath);
        return reply.send(stream);
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
    }
});

// Endpoint: GET /supermarket (Serves the actual deployed tar.gz file directly)
app.get('/supermarket', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const filePath = path.resolve(process.cwd(), 'supermarket-app.tar.gz');

        if (!fs.existsSync(filePath)) {
            return reply.status(404).send({ success: false, error: "supermarket-app.tar.gz not found on server" });
        }

        reply.header('Content-Type', 'application/gzip');
        reply.header('Content-Disposition', 'attachment; filename="supermarket-app.tar.gz"');

        const stream = fs.createReadStream(filePath);
        return reply.send(stream);
    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
    }
});

// Start Server
const start = async () => {
    try {
        await app.listen({ port: config.PORT, host: '0.0.0.0' });
        console.log(`Server listening on ${config.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
