import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
    PORT: z.string().default('3000').transform(Number),
    OLLAMA_HOST: z.string().default('http://127.0.0.1:11434'),
    OLLAMA_TIMEOUT: z.string().default('300000').transform(Number), // 5 minutes
    LOCAL_MODEL: z.string().default('llama3'),
    REASONING_MODEL: z.string().default('minimax-m2:cloud'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
    CONFIDENCE_THRESHOLD: z.string().default('0.7').transform(Number),
    GROK_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    CLAUDE_API_KEY: z.string().optional(),
});

const config = configSchema.parse(process.env);

export default config;
