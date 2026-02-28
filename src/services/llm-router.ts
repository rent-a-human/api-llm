import { Ollama } from 'ollama';
import OpenAI from 'openai';
import config from '../config';
import fs from 'fs';
import path from 'path';
import { extractPdfPayload } from './pdf-service';

const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
const LOG_FILE = path.join(LOG_DIR, 'llm-router.log');

function appendLog(modelName: string, requestPayload: any, responsePayload: any, error?: any) {
    try {
        const timestamp = new Date().toISOString();
        let logEntry = `\n[${timestamp}] --- ${modelName} ---\n`;
        logEntry += `REQUEST: ${JSON.stringify(requestPayload, null, 2)}\n`;
        if (error) {
            logEntry += `ERROR: ${error.message || JSON.stringify(error)}\n`;
        } else {
            logEntry += `RESPONSE: ${JSON.stringify(responsePayload, null, 2)}\n`;
        }
        logEntry += `--------------------------------------------------\n`;
        fs.appendFileSync(LOG_FILE, logEntry, 'utf-8');
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

const ollama = new Ollama({ host: config.OLLAMA_HOST }); // Timeout config not supported in constructor, need to check docs or use fetch. However, ollama-js might handle it or we need to increase fastify timeout.
// Correction: ollama-js request method supports options? No, it's simpler. We rely on the server keeping connection open.
const openai = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

interface LLMResponse {
    answer: string;
    confidence: number;
    source: 'local' | 'online';
}

/**
 * Standard /ask endpoint logic.
 * RESTORED REASONING: Simple, helpful assistant, but with a Chain-of-Thought step.
 * This allows "curl" queries to have depth without the strict JSON/Trap constraints of the Agent.
 */
export async function queryLocalModel(prompt: string): Promise<{ answer: string; confidence: number }> {
    const systemPrompt = `You are a helpful and intelligent general purpose assistant.

    FEATURES: You have manners and know how to do salutations. You respond in the same language as the user.

    INSTRUCTION:
    1. If the user asks for a calculation, fact, or specific value, PROVIDE IT DIRECTLY. Do not be pedantic. If a number is irrational, provide an approximation (e.g., 8 decimal places).
    2. If the user asks for ADVICE or an ACTION, you must analyze the request to ensure logical consistency.

    If user asks for advice/action, follow these steps in your internal reasoning:
    1. Identify the Main Goal of the user.
    2. Identify any Physical Objects involved and their location/state.
    3. List the Conditions that must be true for the goal to be achieved.
    4. Eliminate options that violate these conditions.

    Example 1 (English - Advice):
    User: "I want to unlock my house door. Should I use a banana or a key?"
    REASONING:
    1. Goal: Unlock door.
    2. Object: Door Lock.
    3. Condition: Lock requires a specific metal shape.
    4. Elimination: Banana logic fails. Key logic passes.
    ANSWER: You should use a key.

    Example 2 (Spanish - Advice):
    User: "Quiero hervir agua. ¿Uso una taza de papel o una olla de metal?"
    REASONING:
    1. Goal: Boil water.
    2. Object: Water, Container.
    3. Condition: Container must withstand heat.
    4. Elimination: Paper burns. Metal withstands heat.
    ANSWER: Deberías usar una olla de metal, ya que el papel se quemaría.

    Example 3 (English - Calculation):
    User: "What is the square root of pi?"
    REASONING:
    1. Goal: Calculate sqrt(pi).
    2. Object: Math concept.
    3. Condition: Irrational number.
    4. Elimination: Provide approximation.
    ANSWER: The square root of pi is approximately 1.7725.

    Example 4 (English - Advice):
    User: "I want to wash my car. Should I walk or drive?"
    REASONING:
    1. Goal: Wash car.
    2. Object: Car.
    3. Condition: Car must be at the car wash.
    4. Elimination: Walking leaves car behind. Driving moves car to location.
    ANSWER: You should drive, because you need to move the car to the car wash.
    
    Format your response as follows:
    REASONING: <your step-by-step analysis>
    ANSWER: <your final, helpful answer based on the analysis IN THE SAME LANGUAGE AS THE USER>
    CONFIDENCE: <score 0.0-1.0>`;

    try {
        const response = await ollama.chat({
            model: config.LOCAL_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            stream: false,
        });

        const content = response.message.content;

        // Extract Confidence
        const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);
        const reasoningMatch = content.match(/REASONING:\s*([\d.]+)/i);
        console.log(reasoningMatch);


        let confidence = 0.8; // Default high confidence for general chat
        if (confidenceMatch) {
            confidence = parseFloat(confidenceMatch[1]);
        }

        // Extract Answer
        // remove REASONING and CONFIDENCE blocks to return clean answer if possible, or just return full content if parsing fails
        let cleanAnswer = content;
        const answerMatch = content.match(/ANSWER:\s*([\s\S]*?)(?:\nCONFIDENCE|$)/i);
        if (answerMatch) {
            cleanAnswer = answerMatch[1].trim();
        } else {
            // Fallback cleanup if regex fails
            cleanAnswer = content.replace(/CONFIDENCE:\s*[\d.]+/i, '').replace(/REASONING:[\s\S]*?(?=ANSWER:|$)/i, '').trim();
        }

        return { answer: cleanAnswer, confidence };
    } catch (error) {
        console.error("Local LLM Error:", error);
        return { answer: "Local model failed.", confidence: 0 };
    }
}

export async function queryChessAgent(prompt: string, messages: any[] = [], tools: any[] = []): Promise<{ answer: string; confidence: number }> {
    console.log('[LLM Router] Chess Agent Request (Refined Logic)');

    const enhancedPrompt = `IMPORTANT: Your response must be valid JSON.
    INSTRUCTIONS:
    You must follow this specific reasoning process in the "_reasoning" field before answering:
    1. Restate Goal. 2. Consequences. 3. Verify. 4. Reconsider.
    User Request: ${prompt}`;

    try {
        const response = await ollama.chat({
            model: config.LOCAL_MODEL,
            messages: [
                { role: 'system', content: 'You are an intelligent agent. Output ONLY valid JSON.' },
                { role: 'user', content: enhancedPrompt }
            ],
            stream: false,
        });
        return { answer: response.message.content, confidence: 1.0 };
    } catch (error) {
        console.warn('[LLM Router] Chess Agent (Ollama) failed, attempting online fallback...');
        if (config.GROK_API_KEY) return queryGrokAgent(messages.length > 0 ? messages : [{ role: 'user', content: prompt }], tools);
        return { answer: "{}", confidence: 0 };
    }
}

export async function queryReasoningModel(prompt: string): Promise<{ answer: string; reasoning: string; confidence: number }> {
    console.log('[LLM Router] Reasoning Model Request (Minimax M2)');
    try {
        const response = await ollama.chat({
            model: config.REASONING_MODEL,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        });
        const content = response.message.content;
        let reasoning = "";
        let answer = content;
        const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
            reasoning = thinkMatch[1].trim();
            answer = content.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
        }
        return { answer, reasoning, confidence: 1.0 };
    } catch (error) {
        console.warn('[LLM Router] Reasoning Model (Ollama) failed, attempting online fallback...');
        if (config.GROK_API_KEY) {
            const res = await queryGrokAgent([{ role: 'user', content: prompt }]);
            return { answer: res.answer, reasoning: "Cloud Fallback (Grok)", confidence: 1.0 };
        }
        return { answer: "Reasoning model failed.", reasoning: "", confidence: 0 };
    }
}

export async function queryChessReasoningModel(prompt: string): Promise<{ answer: string; confidence: number }> {
    console.log('[LLM Router] Chess Reasoning Model Request (Minimax M2)');
    const systemPrompt = `You are an intelligent agent.
    1. Output internal reasoning in <think> tags.
    2. After </think>, output ONLY valid JSON.`;

    try {
        const response = await ollama.chat({
            model: config.REASONING_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            stream: false,
        });
        const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
        return { answer: jsonMatch ? jsonMatch[0] : "{}", confidence: 1.0 };
    } catch (error) {
        console.warn('[LLM Router] Chess Reasoning (Ollama) failed, attempting online fallback...');
        if (config.GROK_API_KEY) return queryGrokAgent([{ role: 'user', content: prompt }]);
        return { answer: "{}", confidence: 0 };
    }
}

export async function queryOnlineModel(prompt: string): Promise<string> {
    if (!openai) {
        throw new Error("OpenAI API Key not configured.");
    }
    try {
        const response = await openai.chat.completions.create({
            model: config.OPENAI_MODEL,
            messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content || "No response from online model.";
    } catch (error) {
        console.error("Online LLM Error:", error);
        throw new Error("Online model failed.");
    }
}

export async function routeRequest(prompt: string): Promise<LLMResponse> {
    console.log(`Processing general prompt: "${prompt}"`);
    // General /ask route uses standard logic
    const localResult = await queryLocalModel(prompt);

    if (localResult.confidence >= config.CONFIDENCE_THRESHOLD) {
        return {
            answer: localResult.answer,
            confidence: localResult.confidence,
            source: 'local'
        };
    }

    console.log("Confidence too low. Falling back to online model...");
    try {
        const onlineAnswer = await queryOnlineModel(prompt);
        return {
            answer: onlineAnswer,
            confidence: 1.0,
            source: 'online'
        };
    } catch (error) {
        return {
            answer: localResult.answer + "\n\n(Note: Low confidence local answer, online fallback failed.)",
            confidence: localResult.confidence,
            source: 'local'
        };
    }
}

async function resolveDocumentPayloads(messages: any[]): Promise<any[]> {
    const resolvedMessages = [];
    for (const msg of messages) {
        if (Array.isArray(msg.content)) {
            const newContent = [];
            for (const part of msg.content) {
                if (part.type === 'document' && part.document_url) {
                    const base64Data = part.document_url.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    try {
                        console.log("[LLM Router] Intercepted inline PDF binary, applying Document Intelligence...");
                        const pdfData = await extractPdfPayload(buffer);
                        newContent.push({ type: 'text', text: "\n[ATTACHED PDF DOCUMENT CONTENT]\n" + pdfData.text + "\n[END PDF DOCUMENT]\n" });
                        if (pdfData.images && pdfData.images.length > 0) {
                            for (const imgBase64 of pdfData.images) {
                                newContent.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imgBase64}` } });
                            }
                        }
                    } catch (err) {
                        console.error('[LLM Router] Failed to parse inline PDF:', err);
                        newContent.push({ type: 'text', text: "\n[ATTACHED PDF DOCUMENT FAILED TO PARSE]\n" });
                    }
                } else {
                    newContent.push(part);
                }
            }
            resolvedMessages.push({ ...msg, content: newContent });
        } else {
            resolvedMessages.push(msg);
        }
    }
    return resolvedMessages;
}

export async function queryGeneralAgent(messages: any[], tools?: any[]): Promise<{ answer: string; confidence: number }> {
    console.log('[LLM Router] General Agent Request with Native Tools');

    const resolvedMessages = await resolveDocumentPayloads(messages);

    // Ollama strictly expects content to be a string and images separate.
    // Our frontend sends OpenAI-compatible [{ type: 'text' }, { type: 'image_url' }] arrays.
    const mappedMessages = resolvedMessages.map(msg => {
        if (Array.isArray(msg.content)) {
            let textContent = '';
            let images: string[] = [];
            for (const part of msg.content) {
                if (part.type === 'text') {
                    textContent += part.text + '\n';
                } else if (part.type === 'image_url' && part.image_url?.url) {
                    const base64Data = part.image_url.url.split(',')[1];
                    if (base64Data) images.push(base64Data);
                }
            }
            return {
                role: msg.role,
                content: textContent.trim(),
                images: images.length > 0 ? images : undefined
            };
        }
        return msg;
    });

    try {
        const response = await ollama.chat({
            model: config.REASONING_MODEL,
            messages: mappedMessages,
            tools: tools && tools.length > 0 ? tools : undefined,
            stream: false,
        });

        const message = response.message;

        // Native Tool Call routing
        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            const action = {
                name: toolCall.function.name,
                payload: toolCall.function.arguments
            };
            const finalAns = {
                answer: JSON.stringify({ message: "Executing tool...", action: action }),
                confidence: 1.0
            };
            appendLog('General Agent (Ollama)', { messages: mappedMessages, tools }, finalAns);
            return finalAns;
        }

        // Standard Response
        const finalAns = {
            answer: JSON.stringify({ message: message.content }),
            confidence: 1.0
        };
        appendLog('General Agent (Ollama)', { messages: mappedMessages, tools }, finalAns);
        return finalAns;

    } catch (error: any) {
        console.warn('[LLM Router] Ollama failure, attempting online fallback for /agent...');

        // If it's a connection error (ECONNREFUSED) or we just want to be resilient in the cloud:
        if (config.GROK_API_KEY) {
            console.log('[LLM Router] Falling back to Grok...');
            return queryGrokAgent(messages, tools);
        }

        if (config.OPENAI_API_KEY) {
            console.log('[LLM Router] Falling back to OpenAI...');
            try {
                const prompt = messages[messages.length - 1].content;
                const text = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
                const answer = await queryOnlineModel(text);
                return { answer: JSON.stringify({ message: answer }), confidence: 1.0 };
            } catch (e) {
                console.error('[LLM Router] OpenAI fallback failed:', e);
            }
        }

        console.error('General Agent failed and no online fallback available:', error);
        appendLog('General Agent (Ollama)', { messages: mappedMessages, tools }, null, error);
        throw error; // Last resort 500
    }
}

export async function queryGrokAgent(messages: any[], tools?: any[]): Promise<{ answer: string; confidence: number }> {
    console.log('[LLM Router] Grok Agent Request with Native Tools');

    if (!config.GROK_API_KEY) {
        throw new Error("GROK_API_KEY not configured.");
    }

    try {
        const resolvedMessages = await resolveDocumentPayloads(messages);

        const payload: any = {
            messages: resolvedMessages,
            model: "grok-4-latest",
            stream: false,
            temperature: 0
        };

        if (tools && tools.length > 0) {
            payload.tools = tools;
        }

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.GROK_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Grok API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const message = data.choices[0].message;

        // Native Tool Call routing
        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            const action = {
                name: toolCall.function.name,
                payload: typeof toolCall.function.arguments === 'string'
                    ? JSON.parse(toolCall.function.arguments)
                    : toolCall.function.arguments
            };
            const finalAns = {
                answer: JSON.stringify({ message: "Executing tool...", action: action }),
                confidence: 1.0
            };
            appendLog('Grok Agent', payload, finalAns);
            return finalAns;
        }

        // Standard Response
        const finalAns = {
            answer: JSON.stringify({ message: message.content }),
            confidence: 1.0
        };
        appendLog('Grok Agent', payload, finalAns);
        return finalAns;

    } catch (error) {
        console.error('Grok Agent failed:', error);
        appendLog('Grok Agent', { messages, tools }, null, error);
        throw error;
    }
}
