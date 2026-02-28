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
import { server, SSEServerTransport } from './mcp/server';

let transport: SSEServerTransport;

// Disable the explicit register block to restore Fastify's default JSON parsing
app.get('/mcp/sse', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('[MCP] Connected to SSE');

    // Hijack the underlying raw socket to prevent Fastify from eagerly closing it
    reply.hijack();

    if (transport) {
        try {
            // Unbind the previous active transport from the singleton server
            await server.close();
        } catch (e) {
            console.error('[MCP] Error closing previous server connection:', e);
        }
    }

    transport = new SSEServerTransport('/mcp/message', reply.raw);
    await server.connect(transport);

    // Keep-alive heartbeat to prevent Vite proxy and NGINX from dropping idle connections
    const keepAlive = setInterval(() => {
        try {
            reply.raw.write(':\n\n');
        } catch (e) {
            clearInterval(keepAlive);
        }
    }, 15000);

    // If the client disconnects, clean up
    request.raw.on('close', () => {
        console.log('[MCP] Client disconnected');
        clearInterval(keepAlive);
    });
});

app.post('/mcp/message', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('[MCP] Message received');
    if (transport) {
        try {
            // Fastify has automatically parsed the JSON body into request.body
            // We pass it directly to the internal message handler, bypassing the SDK's raw stream fetcher
            await transport.handleMessage(request.body as any);
            return reply.status(202).send("Accepted");
        } catch (error) {
            console.error('[MCP] Error handling message:', error);
            return reply.status(500).send({ error: "Failed to handle message" });
        }
    } else {
        return reply.status(500).send({ error: "Transport not initialized" });
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
