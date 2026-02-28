import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import config from './config';
import { routeRequest, queryChessAgent, queryReasoningModel, queryChessReasoningModel, queryGeneralAgent, queryGrokAgent } from './services/llm-router';
import multipart from '@fastify/multipart';
import { extractPdfPayload } from './services/pdf-service';

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

            if (part.mimetype === 'application/pdf') {
                console.log(`[API] /upload Processing PDF: ${part.filename} (${buffer.length} bytes)`);
                const pdfData = await extractPdfPayload(buffer);
                results.push({
                    filename: part.filename,
                    mimeType: part.mimetype,
                    extractedText: pdfData.text,
                    images: pdfData.images, // Only populated if scanned document
                    isScanned: pdfData.isScanned
                });
            } else {
                // Fallback for non-PDFs (e.g., standard images). Just return as Base64.
                results.push({
                    filename: part.filename,
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

// Map of sessionId -> { transport, server }
const activeConnections = new Map<string, { transport: SSEServerTransport, server: any }>();

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

    // Track the connection BEFORE connecting to ensure the map is populated immediately
    activeConnections.set(sessionId, { transport, server: serverInstance });
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
            const session = activeConnections.get(sessionId);
            if (session) {
                console.log(`[MCP] Cleaning up expired session: ${sessionId}`);
                session.server.close().catch((err: any) => console.error(`[MCP] Error closing server for ${sessionId}:`, err));
                activeConnections.delete(sessionId);
            }
        }, 3000);
    });
});

app.post('/mcp/message', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = (request.query as any).sessionId;
    const bodySize = JSON.stringify(request.body).length;
    console.log(`[MCP] [DEBUG] Incoming POST for Session: [${sessionId}] (Size: ${bodySize} bytes)`);

    if (!sessionId) {
        console.warn(`[MCP] [ERROR] POST missing sessionId query parameter.`);
        return reply.status(400).send({ error: "Missing sessionId" });
    }

    const session = activeConnections.get(sessionId);
    if (!session) {
        console.warn(`[MCP] [404] Session ${sessionId} NOT FOUND in map.`);
        console.log(`[MCP] [VERBOSE] Known Sessions in memory: [${Array.from(activeConnections.keys()).join(', ')}]`);
        return reply.status(404).send({ error: "Session not found or expired" });
    }

    try {
        await session.transport.handleMessage(request.body as any);
        return reply.status(202).send("Accepted");
    } catch (error: any) {
        console.error(`[MCP] [ERROR] Internal error handling message for ${sessionId}:`, error.message);
        return reply.status(500).send({ error: "Failed to handle message" });
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
