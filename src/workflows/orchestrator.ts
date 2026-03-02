import { taskQueue } from './queue';
import { queryGeneralAgent } from '../services/llm-router';
import { backendTools, executeBackendTool } from '../mcp/server';

class Orchestrator {
    private isRunning = false;
    private intervalId?: NodeJS.Timeout;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[Orchestrator] Started iterative execution loop.');
        this.intervalId = setInterval(() => this.processNextTask(), 5000);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        console.log('[Orchestrator] Stopped iterative execution loop.');
    }

    private async processNextTask() {
        if (!this.isRunning) return;

        const task = taskQueue.getNextPendingTask();
        if (!task) return; // No pending tasks

        console.log(`\n[Orchestrator] --------------------------------------------------`);
        console.log(`[Orchestrator] Processing Task [${task.id}]: ${task.description}`);

        try {
            // First pass: Ask the General Agent to create a plan / execute it
            // The General Agent leverages available MCP tools

            let systemPrompt = `You are an autonomous digital worker. Your objective is to achieve the user's task. Use available tools (like execute_terminal_command, read_file, etc.) to investigate, plan, run, test, and deploy. Only return your final answer once you have completely solved the objective.`;

            // If the task previously asked for help and was unblocked, inject the human's response
            if (task.humanResponse) {
                systemPrompt += `\n\n[PREVIOUS INTERVENTION] You previously paused this task because you needed human intervention with the following reason: "${task.blockedReason}". The human has provided the following response: "${task.humanResponse}". Please use this information to continue and finish the objective.`;
                // Clear it so we don't repeat endlessly if it blocks again
                task.humanResponse = undefined;
                task.blockedReason = undefined;
            }

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: task.description }
            ];

            // Provide a custom tool specific to the Orchestrator loop so the agent can ask for help
            const orchestratorTools = [{
                type: "function",
                function: {
                    name: "request_human_intervention",
                    description: "Use this tool to pause your execution and ask the human for help. ONLY use this if you absolutely require credentials, authentication codes, or a critical binary decision that you cannot make safely. Once called, your execution will suspend until the human replies.",
                    parameters: {
                        type: "object",
                        properties: {
                            reason: {
                                type: "string",
                                description: "The specific question or prompt you need the human to answer (e.g., 'Please provide the GitHub PAT')."
                            }
                        },
                        required: ["reason"]
                    }
                }
            }];

            // We intercept the queryGeneralAgent call to see if it used our custom tool or returned normally
            // Note: Since queryGeneralAgent executes a conversation loop internally for standard MCP tools, 
            // if we inject a custom tool we also need the router to recognize it and yield. 
            // For now, we'll append the instructions directly to the prompt to force the llm to yield a specific JSON block.

            // Refactored prompt approach since queryGeneralAgent abstracts the internal tool loop:
            systemPrompt += `\n\nSPECIAL INSTRUCTIONS:\n1. If you absolutely require human intervention (e.g., credentials, secrets, or critical decisions), you must stop and output exactly this JSON block on a new line: \n\`\`\`json\n{ "type": "HUMAN_INTERVENTION", "reason": "Your specific question here" }\n\`\`\`\n2. If you need to wait for a long-running process (like npm install) to finish, output exactly this JSON block to sleep: \n\`\`\`json\n{ "type": "ASYNC_WAIT", "seconds": 5, "reason": "Waiting for server to start" }\n\`\`\`\n\nDo not output anything else after yielding a JSON block.`;
            messages[0].content = systemPrompt;

            const allTools = [...backendTools, ...orchestratorTools];

            let loopCount = 0;
            const MAX_LOOPS = 25;
            let finalResultStr = "";

            while (loopCount < MAX_LOOPS) {
                loopCount++;
                taskQueue.addLog(task.id, `Querying General Agent (turn ${loopCount})...`);
                const result = await queryGeneralAgent(messages, allTools);

                let displayMsg = typeof result === 'string' ? result : JSON.stringify(result);
                let parsedAns: any = {};

                try {
                    let answerObj = typeof (result as any)?.answer === 'string' ? (result as any).answer : displayMsg;
                    try {
                        parsedAns = JSON.parse(answerObj);
                        if (parsedAns.message) displayMsg = parsedAns.message;
                    } catch (e) {
                        displayMsg = answerObj;
                    }
                    taskQueue.addLog(task.id, `Received response from General Agent: ${displayMsg}`);
                } catch (e) {
                    taskQueue.addLog(task.id, `Received response from General Agent.`);
                }

                // 1. Check if the agent yielded the HUMAN_INTERVENTION block (legacy text fallback)
                const interventionMatch = displayMsg.match(/```json\s*(\{[\s\S]*?"type":\s*"HUMAN_INTERVENTION"[\s\S]*?\})\s*```/);
                if (interventionMatch) {
                    try {
                        const parsed = JSON.parse(interventionMatch[1]);
                        taskQueue.updateTaskStatus(task.id, 'BLOCKED', undefined, undefined, parsed.reason || "Human intervention required.");
                        console.log(`[Orchestrator] Task [${task.id}] BLOCKED waiting for human: ${parsed.reason}`);
                        return; // Exit the loop for this task
                    } catch (e) {
                        console.error("Failed to parse HUMAN_INTERVENTION block", e);
                    }
                }

                // 2. Check if the agent yielded the ASYNC_WAIT block (legacy text fallback)
                const waitMatch = displayMsg.match(/```json\s*(\{[\s\S]*?"type":\s*"ASYNC_WAIT"[\s\S]*?\})\s*```/);
                if (waitMatch) {
                    try {
                        const parsed = JSON.parse(waitMatch[1]);
                        const waitMs = (parsed.seconds || 5) * 1000;
                        console.log(`[Orchestrator] Task [${task.id}] WAITING for ${waitMs}ms: ${parsed.reason}`);

                        if (waitMs <= 10000) {
                            taskQueue.addLog(task.id, `Agent requested to WAIT for ${parsed.seconds}s: ${parsed.reason}. Sleeping inline...`);
                            await new Promise(resolve => setTimeout(resolve, waitMs));
                            task.status = 'PENDING';
                            taskQueue.addLog(task.id, `Awoke from sleep. Task re-queued as PENDING.`);
                            task.description += `\n[SYSTEM] You waited ${parsed.seconds} seconds because: ${parsed.reason}. Please continue.`;
                            return;
                        } else {
                            task.status = 'PENDING';
                            taskQueue.addLog(task.id, `Agent requested LONG WAIT for ${parsed.seconds}s: ${parsed.reason}. Re-queued as PENDING instantly.`);
                            task.description += `\n[SYSTEM] Attempted to wait ${parsed.seconds} seconds. Check if your process finished.`;
                            return;
                        }
                    } catch (e) {
                        console.error("Failed to parse ASYNC_WAIT block", e);
                    }
                }

                // 3. Process Native Tool Call (if returned by llm-router)
                if (parsedAns.action) {
                    const action = parsedAns.action;

                    if (action.name === 'request_human_intervention') {
                        taskQueue.updateTaskStatus(task.id, 'BLOCKED', undefined, undefined, action.payload?.reason || "Human intervention required.");
                        console.log(`[Orchestrator] Task [${task.id}] BLOCKED waiting for human: ${action.payload?.reason}`);
                        return; // Suspend
                    }

                    try {
                        taskQueue.addLog(task.id, `Executing backend tool: ${action.name}...`);
                        const toolResult = await executeBackendTool(action.name, action.payload);

                        let toolOutput = Array.isArray(toolResult?.content) ? toolResult.content.map((c: any) => c.text).join('\n') : JSON.stringify(toolResult);
                        messages.push({
                            role: 'user',
                            content: `[SYSTEM MESSAGE]: The tool action you requested (${action.name}) has been completed.\n\nTOOL RESULT DATA:\n${toolOutput}\n\nCRITICAL INSTRUCTION: Analyze the result and continue working towards the objective. DO NOT STOP until the entire task is solved.`
                        });
                        continue;
                    } catch (err: any) {
                        taskQueue.addLog(task.id, `Tool execution failed: ${err.message}`);
                        messages.push({
                            role: 'user',
                            content: `[SYSTEM MESSAGE]: The tool action you requested (${action.name}) FAILED with error: ${err.message}. Please try a different approach or fix the arguments.`
                        });
                        continue;
                    }
                } else {
                    // It's a final conversational answer without a tool call
                    finalResultStr = displayMsg;
                    break;
                }
            }

            if (loopCount >= MAX_LOOPS) {
                taskQueue.addLog(task.id, `WARNING: Hit max loop count of ${MAX_LOOPS}. Terminating task.`);
            }

            taskQueue.updateTaskStatus(task.id, 'COMPLETED', finalResultStr);
            console.log(`[Orchestrator] Task [${task.id}] COMPLETED.`);
        } catch (error: any) {
            console.error(`[Orchestrator] Task [${task.id}] FAILED. Error:`, error);
            taskQueue.updateTaskStatus(task.id, 'FAILED', undefined, error.message || String(error));
        } finally {
            console.log(`[Orchestrator] --------------------------------------------------\n`);
        }
    }
}

export const orchestrator = new Orchestrator();

// Auto-start listening on initialization
orchestrator.start();
