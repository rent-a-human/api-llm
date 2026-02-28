
import { queryReasoningModel, queryChessReasoningModel } from './src/services/llm-router';

async function testDeepseek() {
    console.log("=== Testing Deepseek R1 Endpoints ===");
    const prompt = "I want to wash my car, and the car wash is 50m away. Should I walk or drive?";

    console.log("\n1. Testing /reason (General Reasoning)...");
    const reasonResult = await queryReasoningModel(prompt);
    console.log("Answer:", reasonResult.answer);
    console.log("Thinking Process (Length):", reasonResult.reasoning.length, "chars");
    console.log("Thinking Preview:", reasonResult.reasoning.substring(0, 150) + "...");

    console.log("\n2. Testing /chess-reason (Agent JSON)...");
    const chessResult = await queryChessReasoningModel(prompt);
    console.log("Raw Answer:", chessResult.answer);

    try {
        const parsed = JSON.parse(chessResult.answer);
        console.log("Parsed JSON Message:", parsed.message);
    } catch (e) {
        console.error("FAILED to parse JSON:", e);
    }
}

testDeepseek();
