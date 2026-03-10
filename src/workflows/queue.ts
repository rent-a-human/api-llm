import fs from 'fs';
import path from 'path';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TESTING' | 'DEPLOYING' | 'BLOCKED';

export interface TaskLog {
    timestamp: number;
    message: string;
    thinking?: string;
    content?: string;
}

export interface Task {
    id: string;
    level: number;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TESTING' | 'DEPLOYING' | 'BLOCKED';
    result?: string;
    error?: string;
    blockedReason?: string; // Prompt/question for the human
    humanResponse?: string; // The answer provided by the human
    createdAt: number;
    updatedAt: number;
    logs: TaskLog[];
}

class TaskQueue {
    private queue: Task[] = [];
    private dbPath: string;

    constructor() {
        this.dbPath = path.join(process.cwd(), '.data', 'tasks.json');
        this.loadQueue();
    }

    private loadQueue() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.queue = JSON.parse(data);
                console.log(`[TaskQueue] Loaded ${this.queue.length} tasks from ${this.dbPath}`);
            }
        } catch (e) {
            console.error('[TaskQueue] Error loading tasks:', e);
            this.queue = [];
        }
    }

    private saveQueue() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dbPath, JSON.stringify(this.queue, null, 2));
        } catch (e) {
            console.error('[TaskQueue] Error saving tasks:', e);
        }
    }

    addTask(description: string, level: number = 2): string {
        const task: Task = {
            id: crypto.randomUUID(),
            level,
            description,
            status: 'PENDING',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            logs: [{ timestamp: Date.now(), message: `Task created at level ${level}` }]
        };
        this.queue.push(task);
        this.sortQueue();
        return task.id;
    }

    private sortQueue() {
        // Sort by level (highest first), then by creation time
        this.queue.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return a.createdAt - b.createdAt;
        });
        this.saveQueue();
    }

    getNextPendingTask(): Task | undefined {
        const task = this.queue.find(t => t.status === 'PENDING');
        if (task) {
            task.status = 'IN_PROGRESS';
            task.updatedAt = Date.now();
            task.logs.push({ timestamp: Date.now(), message: `Status updated to IN_PROGRESS` });
            this.saveQueue();
        }
        return task;
    }

    updateTaskStatus(id: string, status: TaskStatus, result?: any, error?: string, blockedReason?: string, humanResponse?: string): boolean {
        const task = this.queue.find(t => t.id === id);
        if (task) {
            task.status = status;
            task.updatedAt = Date.now();
            if (result !== undefined) task.result = result;
            if (error !== undefined) task.error = error;
            if (blockedReason !== undefined) task.blockedReason = blockedReason;
            if (humanResponse) {
                task.humanResponse = humanResponse;
            }
            task.logs.push({ timestamp: Date.now(), message: `Status updated to ${status}` + (blockedReason ? ` - Reason: ${blockedReason}` : '') + (error ? `\n\n**Error Information:**\n${error}` : '') });
            this.saveQueue();
            return true;
        }
        return false;
    }

    addLog(taskId: string, message: string, thinking?: string, content?: string) {
        const task = this.getTask(taskId);
        if (task) {
            task.logs.push({ timestamp: Date.now(), message, thinking, content });
            this.saveQueue();
        }
    }

    provideHumanResponse(taskId: string, response: string): boolean {
        const task = this.queue.find(t => t.id === taskId);
        if (task && task.status === 'BLOCKED') {
            task.humanResponse = response;
            task.status = 'PENDING'; // Re-queue it for processing
            task.updatedAt = Date.now();
            task.logs.push({ timestamp: Date.now(), message: `Human provided response: "${response}". Task re-queued.` });
            this.sortQueue(); // Re-sort to prioritize unblocked items if needed
            return true;
        }
        return false;
    }

    retryTask(taskId: string): boolean {
        const task = this.queue.find(t => t.id === taskId);
        if (task && task.status === 'FAILED') {
            task.status = 'PENDING';
            task.updatedAt = Date.now();
            task.logs.push({ timestamp: Date.now(), message: `Task retry initiated by user. Re-queued.` });
            this.sortQueue();
            return true;
        }
        return false;
    }

    getTask(id: string): Task | undefined {
        return this.queue.find(t => t.id === id);
    }

    getAllTasks(): Task[] {
        return [...this.queue];
    }

    clearCompleted() {
        this.queue = this.queue.filter(t => t.status !== 'COMPLETED');
        this.saveQueue();
    }
}

// Export a singleton instance
export const taskQueue = new TaskQueue();
