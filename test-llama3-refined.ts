
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

async function testLlama3Refined() {
    console.log("Testing Llama3 with Refined Prompting...");

    const userRequest = "I want to wash my car, and the car wash is 50m away. Should I walk or drive?";

    // The user's requested refined prompt structure
    const refinedPrompt = `${userRequest} 
    
    Before answering, please: 
    1. Restate what I'm actually trying to accomplish 
    2. Think through the logical consequences of each option 
    3. Verify that your answer makes sense given my goal 
    4. If your answer doesn't align with my stated goal, reconsider
    
    Output your reasoning first, then your final decision.`;

    try {
        const response = await ollama.chat({
            model: 'llama3',
            messages: [{ role: 'user', content: refinedPrompt }],
            stream: false,
        });

        console.log("\n--- MODEL RESPONSE ---");
        console.log(response.message.content);
        console.log("----------------------");

    } catch (error) {
        console.error("Error:", error);
    }
}

testLlama3Refined();
