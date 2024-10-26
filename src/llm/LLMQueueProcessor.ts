import { AIMessage, AIMessageChunk, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

import { logger } from "../utils";
import type { AIChatInput } from "../types/AIChatInput";
import type { LLMQueueProcessorOptions } from "../types/LLMQueueProcessorOptions";

/**
 * Abstract class representing a processor for handling an LLM queue.
 * Manages request limits and processes chat inputs through an AI model.
 */
export abstract class LLMQueueProcessor {
    private queue: AIChatInput[] = [];
    private readonly SYSTEM_PROMPT: string;
    private readonly MAX_REQUESTS_PER_MINUTE: number;
    private readonly MAX_TOKEN_PER_MINUTE: number;
    private readonly MAX_REQUESTS_PER_DAY: number;
    private readonly REQUEST_RATE_SECONDS: number;
    private readonly QUEUE_RATE_LIMIT_CHECK_SECONDS: number;
    private readonly MAX_SKIPS_PER_REQUEST: number; // Used to handle retries for a given prompt
    private pauseQueueMinutes = false;
    private pauseQueueDays = false;
    private requestCounterMinute = 0;
    private requestCounterDay = 0;
    private tokenCounterMinute = 0;
    private isQueueCheckRunning = false;
    private coolDownMinutesTimer: NodeJS.Timer | null = null;
    private coolDownDaysTimer: NodeJS.Timer | null = null;

    /**
     * Constructs an LLMQueueProcessor instance with the specified parameters.
     * @param {LLMQueueProcessorOptions} params - The configuration options for the processor.
     */
    constructor(params: LLMQueueProcessorOptions) {
        this.SYSTEM_PROMPT = params.systemPrompt;
        this.MAX_REQUESTS_PER_DAY = params.maxRequestsPerDay;
        this.MAX_REQUESTS_PER_MINUTE = params.maxRequestsPerMinute;
        this.MAX_TOKEN_PER_MINUTE = params.maxTokenPerMinute;
        this.MAX_SKIPS_PER_REQUEST = params.maxSkipsPerRequest;
        this.QUEUE_RATE_LIMIT_CHECK_SECONDS = params.queueRateLimitCheckSeconds;
        this.REQUEST_RATE_SECONDS = params.requestRateSeconds;
    }

    /**
     * Adds a user input to the processing queue and initiates queue processing.
     * @param {AIChatInput} userInput - The chat input to add to the queue.
     */
    public async addToQueue(userInput: AIChatInput) {
        this.queue.push(userInput);
        this.processQueue();
    }

    /**
     * Formats the AI chat input into a sequence of base messages for model invocation.
     * @param {AIChatInput} input - The chat input to format.
     * @returns {BaseMessage[]} The formatted chat history.
     */
    protected formatLLMInput(input: AIChatInput): BaseMessage[] {
        const formattedHistory: BaseMessage[] = [new SystemMessage({ content: this.SYSTEM_PROMPT })];

        for (const { message, isHuman } of input.chatHistory) {
            formattedHistory.push(isHuman ? new HumanMessage({ content: message }) : new AIMessage({ content: message }));
        }

        formattedHistory.push(new HumanMessage({ content: input.prompt }));
        return formattedHistory;
    }

    /**
     * Initiates the processing of the queue if not already running.
     */
    private processQueue() {
        if (this.isQueueCheckRunning) return;

        this.isQueueCheckRunning = true;
        this.queueLimitChecks();
        this.processQueueItem();
    }

    /**
     * Processes each item in the queue at intervals defined by REQUEST_RATE_SECONDS.
     */
    private processQueueItem() {
        setInterval(async () => {
            logger.info(`Request: ${this.requestCounterMinute} | Token: ${this.tokenCounterMinute} | Queue: ${this.queue.length}`);

            if (this.queue.length > 0 && !this.pauseQueueMinutes && !this.pauseQueueDays) {
                const task = this.queue.shift();
                if (!task) return;

                await task.threadMessage.edit("Processing...");

                if (task.skips >= this.MAX_SKIPS_PER_REQUEST) {
                    await task.threadMessage.edit("Too many skips. Cancelling Request. Please Try Again.");
                    return;
                }

                const chatHistory = this.formatLLMInput(task);
                try {
                    const modelResponse = await this.invokeModel(chatHistory);
                    await task.threadMessage.edit(modelResponse.content as string);

                    this.requestCounterMinute++;
                    this.requestCounterDay++;
                    this.tokenCounterMinute += modelResponse.usage_metadata?.total_tokens || 0;

                    // Restart the minute and day cool down timers every prompt request
                    this.createCoolDownMinutesTimer();
                    this.createCoolDownDaysTimer();

                } catch (error) {
                    task.skips++;
                    this.queue.push(task);
                    logger.error(error);
                }
            }
        }, 1000 * this.REQUEST_RATE_SECONDS);
    }

    /**
     * Performs periodic checks on queue limits and pauses the queue if limits are exceeded.
     */
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
            }, 1000 * this.QUEUE_RATE_LIMIT_CHECK_SECONDS);
        }
    }

    /**
     * Resets the minute-based cooldown timer and counters after a specified duration.
     */
    private createCoolDownMinutesTimer() {
        if (this.coolDownMinutesTimer) {
            clearTimeout(this.coolDownMinutesTimer);
            this.coolDownMinutesTimer = null;
        }

        logger.info("Creating cool down timer for minutes");
        this.coolDownMinutesTimer = setTimeout(() => {
            this.pauseQueueMinutes = false;
            this.tokenCounterMinute = 0;
            this.requestCounterMinute = 0;
        }, 1000 * 60);
    }

    /**
     * Resets the day-based cooldown timer and counters after a specified duration.
     */
    private createCoolDownDaysTimer() {
        if (this.coolDownDaysTimer) {
            clearTimeout(this.coolDownDaysTimer);
            this.coolDownDaysTimer = null;
        }

        logger.info("Creating cool down timer for days");
        this.coolDownDaysTimer = setTimeout(() => {
            this.pauseQueueDays = false;
            this.tokenCounterMinute = 0;
            this.requestCounterMinute = 0;
            this.requestCounterDay = 0;
        }, 1000 * 60 * 60 * 24);
    }

    /**
     * Abstract method to invoke the AI model with the given chat history.
     * @param {BaseMessage[]} chatHistory - The formatted chat history.
     * @returns {Promise<AIMessageChunk>} The response from the AI model.
     */
    protected abstract invokeModel(chatHistory: BaseMessage[]): Promise<AIMessageChunk>;
}
