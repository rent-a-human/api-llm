
import { queryLocalModel } from './src/services/llm-router';

async function test() {
    console.log("Testing specific trap question...");
    const prompt = "I want to wash my car, and the car wash is 50m away. Should I walk or drive?";
    const result = await queryLocalModel(prompt);
    console.log("\n--- RESULT ---");
    console.log("Answer:", result.answer);
    console.log("Confidence:", result.confidence);
}

test();
