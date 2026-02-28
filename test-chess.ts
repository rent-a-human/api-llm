
import { queryChessAgent } from './src/services/llm-router';

async function testChess() {
    console.log("Testing CHESS specific reasoning...");
    const prompt = "I want to wash my car, and the car wash is 50m away. Should I walk or drive?";
    const result = await queryChessAgent(prompt);
    console.log("\n--- RESULT ---");
    console.log("Answer (Raw JSON):", result.answer);
    try {
        const parsed = JSON.parse(result.answer);
        console.log("\nReasoning Field:", parsed._reasoning);
        console.log("Message Field:", parsed.message);
    } catch (e) {
        console.log("Failed to parse JSON");
    }
}

testChess();
