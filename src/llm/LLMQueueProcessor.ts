import { AIMessage, AIMessageChunk, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

import type { AIChatInput } from "../types/AIChatInput";
import type { LLMQueueProcessorOptions } from "../types/LLMQueueProcessorOptions";

export abstract class LLMQueueProcessor {
    private queue: AIChatInput[] = [];

    private readonly SYSTEM_PROMPT: string;
    private readonly MAX_REQUESTS_PER_MINUTE: number;
    private readonly MAX_TOKEN_PER_MINUTE: number;
    private readonly MAX_REQUESTS_PER_DAY: number;
    private readonly REQUEST_RATE_SECONDS: number;
    private readonly QUEUE_RATE_LIMIT_CHECK_SECONDS: number;
    private readonly MAX_SKIPS_PER_REQUEST: number;

    private pauseQueueMinutes = false;
    private pauseQueueDays = false;

    private requestCounterMinute = 0;
    private requestCounterDay = 0;
    private tokenCounterMinute = 0;

    private isQueueCheckRunning = false;

    constructor(params: LLMQueueProcessorOptions) {
        this.SYSTEM_PROMPT = params.systemPrompt;
        this.MAX_REQUESTS_PER_DAY = params.maxRequestsPerDay;
        this.MAX_REQUESTS_PER_MINUTE = params.maxRequestsPerMinute;
        this.MAX_TOKEN_PER_MINUTE = params.maxTokenPerMinute;
        this.MAX_SKIPS_PER_REQUEST = params.maxSkipsPerRequest;
        this.QUEUE_RATE_LIMIT_CHECK_SECONDS = params.queueRateLimitCheckSeconds;
        this.REQUEST_RATE_SECONDS = params.requestRateSeconds;
    }

    public async addToQueue(userInput: AIChatInput) {
        this.queue.push(userInput);
        this.processQueue();
    }

    protected formatLLMInput(input: AIChatInput): BaseMessage[] {
        const formattedHistory: BaseMessage[] = [new SystemMessage({ content: this.SYSTEM_PROMPT })];

        for (const { message, isHuman } of input.chatHistory) {
            formattedHistory.push(isHuman ? new HumanMessage({ content: message }) : new AIMessage({ content: message }));
        }

        formattedHistory.push(new HumanMessage({ content: input.prompt }));
        return formattedHistory;
    }

    private processQueue() {
        if (this.isQueueCheckRunning) return;

        this.isQueueCheckRunning = true;
        this.queueLimitChecks();
        this.queueRateLimitReset();
        this.processQueueItem();
    }

    private processQueueItem() {
        setInterval(async () => {
            console.log(`Request: ${this.requestCounterMinute} | Token: ${this.tokenCounterMinute} | Queue: ${this.queue.length}`);

            if (this.queue.length > 0 && !this.pauseQueueMinutes && !this.pauseQueueDays) {
                const task = this.queue.shift();

                if (!task) return;

                await task.threadMessage.edit("Processing...");

                if (task.skips >= this.MAX_SKIPS_PER_REQUEST) {
                    await task.threadMessage.edit("Too many skips. Cancelling Request. Please Try Again.");
                    return;
                }

                const chatHistory = this.formatLLMInput(task);
                // console.log(chatHistory);

                try {
                    const modelResponse = await this.invokeModel(chatHistory);
                    await task.threadMessage.edit(modelResponse.content as string);

                    this.requestCounterMinute++;
                    this.requestCounterDay++;
                    this.tokenCounterMinute += modelResponse.usage_metadata?.total_tokens || 0;

                } catch (error) {
                    task.skips++;
                    this.queue.push(task);
                    console.log(error);
                }
            }
        }, 1000 * this.REQUEST_RATE_SECONDS);
    }

    private queueLimitChecks() {
        if (!this.pauseQueueMinutes && !this.pauseQueueDays) {
            setInterval(() => {
                if (this.requestCounterDay >= this.MAX_REQUESTS_PER_DAY) {
                    console.log("Max requests per day reached. Pausing queue.");
                    this.pauseQueueDays = true;
                }

                if (this.requestCounterMinute >= this.MAX_REQUESTS_PER_MINUTE) {
                    console.log("Max requests per minute reached. Pausing queue.");
                    this.pauseQueueMinutes = true;
                }

                if (this.tokenCounterMinute >= this.MAX_TOKEN_PER_MINUTE) {
                    console.log("Max token per minute reached. Pausing queue.");
                    this.pauseQueueMinutes = true;
                }

                this.queueCoolDown();
            }, 1000 * this.QUEUE_RATE_LIMIT_CHECK_SECONDS);
        }
    }

    private queueCoolDown() {
        if (this.pauseQueueMinutes) {
            setTimeout(() => {
                this.pauseQueueMinutes = false;
                this.tokenCounterMinute = 0;
                this.requestCounterMinute = 0;
            }, 1000 * 60);
        }

        if (this.pauseQueueDays) {
            setTimeout(() => {
                this.pauseQueueDays = false;
                this.pauseQueueMinutes = false;
                this.tokenCounterMinute = 0;
                this.requestCounterMinute = 0;
                this.requestCounterDay = 0;
            }, 1000 * 60 * 60 * 24);
        }
    }

    private queueRateLimitReset() {
        setTimeout(() => {
            if (!this.pauseQueueMinutes) {
                this.tokenCounterMinute = 0;
                this.requestCounterMinute = 0;
            }
        }, 1000 * 60);

        setTimeout(() => {
            if (!this.pauseQueueDays) {
                this.tokenCounterMinute = 0;
                this.requestCounterMinute = 0;
                this.requestCounterDay = 0;
            }
        }, 1000 * 60 * 60 * 24);
    }

    protected abstract invokeModel(chatHistory: BaseMessage[]): Promise<AIMessageChunk>;
}