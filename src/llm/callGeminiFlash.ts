import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { LocalStorage } from "node-localstorage";

import { LLMQueueProcessor } from "./LLMQueueProcessor";
import { dateDifferenceByDays, dateDifferenceByMinutes, getEnvVar, logger } from "../utils";

import type { AIChatInput } from "../types/AIChatInput";
import type { LLMQueueProcessorOptions } from "../types/LLMQueueProcessorOptions";

const MODEL = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 1000,
    apiKey: getEnvVar("GEMINI_API_KEY"),
    temperature: 0.7,
});

// ! NOTE: Discord has a 2000 character limit on messages, please keep this below 2000
const SYSTEM_PROMPT = `
# Role
You are a helpful AI assistant. Always think before responding to the user! 

# Response
Keep you response short and to the point. About 500 words max.
`;
const MAX_REQUESTS_PER_MINUTE = 15;
const MAX_TOKEN_PER_MINUTE = 1000000;
const MAX_REQUESTS_PER_DAY = 1500;
const REQUEST_RATE_SECONDS = 3;
const QUEUE_RATE_LIMIT_CHECK_SECONDS = 1;
const MAX_SKIPS_PER_REQUEST = 3;

/**
 * A GeminiFlash is a LLMQueueProcessor that uses the Gemini Flash model.
 */
class GeminiFlash extends LLMQueueProcessor {
    /**
     * Constructs a new GeminiFlash instance with the specified parameters.
     * @param {LLMQueueProcessorOptions} params - The configuration options for the processor.
     */
    constructor(params: LLMQueueProcessorOptions) {
        super(params);
    }

    /**
     * Invokes the Gemini Flash model with the given chat history.
     * @param {BaseMessage[]} chatHistory - The chat history to pass to the model.
     * @returns {Promise<AIMessageChunk>} A promise that resolves with the model's response.
     */
    protected async invokeModel(chatHistory: BaseMessage[]): Promise<AIMessageChunk> {
        return await MODEL.invoke(chatHistory);
    }

    public loadRateLimits(): void {
        logger.info("Loading Gemini Flash rate limits");
        const storage = new LocalStorage("./rate_limits_save")
        const lastLimits = storage.getItem("GoogleGenAI.json") == null ? null : JSON.parse(storage.getItem("GoogleGenAI.json") as string);

        const currentDate = new Date(new Date().toUTCString());
        const lastTime = lastLimits ? new Date(lastLimits.lastTime) : null;

        if (lastLimits && lastTime) {
            // Check if number of days between last request made and now is less then 1 day
            if (dateDifferenceByDays(currentDate, lastTime) < 1) {
                this.pauseQueueDays = lastLimits.pauseQueueDays;
                this.requestCounterDay = lastLimits.requestCounterDay;
                this.createCoolDownDaysTimer();
            }

            // Check if time between last request made and now is less then 1 minute
            if (dateDifferenceByMinutes(currentDate, lastTime) < 1) {
                this.pauseQueueMinutes = lastLimits.pauseQueueMinutes;
                this.requestCounterMinute = lastLimits.requestCounterMinute;
                this.tokenCounterMinute = lastLimits.tokenCounterMinute;
                this.createCoolDownMinutesTimer();
            }
        }
    }

    public saveRateLimits(): void {
        // Save data to local storage as a json
        const saveDataToStorage = () => {
            logger.info("Saving Gemini Flash rate limits");
            const storage = new LocalStorage("./rate_limits_save")
            storage.setItem("GoogleGenAI.json", JSON.stringify({
                pauseQueueMinutes: this.pauseQueueMinutes,
                pauseQueueDays: this.pauseQueueDays,
                requestCounterMinute: this.requestCounterMinute,
                requestCounterDay: this.requestCounterDay,
                tokenCounterMinute: this.tokenCounterMinute,
                lastTime: new Date(new Date().toUTCString())
            }))
        }

        process.on('exit', () => {
            saveDataToStorage();
        });

        // Use for when Ctrl + C is pressed
        process.on('SIGINT', () => {
            process.exit(0);
        });

        process.on('uncaughtException', () => {
            process.exit(1);
        });
    }
}

const Gemini_Flash = new GeminiFlash({
    systemPrompt: SYSTEM_PROMPT,
    maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
    maxTokenPerMinute: MAX_TOKEN_PER_MINUTE,
    maxRequestsPerDay: MAX_REQUESTS_PER_DAY,
    requestRateSeconds: REQUEST_RATE_SECONDS,
    queueRateLimitCheckSeconds: QUEUE_RATE_LIMIT_CHECK_SECONDS,
    maxSkipsPerRequest: MAX_SKIPS_PER_REQUEST
});
Gemini_Flash.loadRateLimits();
Gemini_Flash.saveRateLimits();

/**
 * Adds a user input to the Gemini Flash queue and initiates queue processing.
 * @param {AIChatInput} userInput - The chat input to add to the queue.
 */
export async function callGeminiFlash(userInput: AIChatInput) {
    await Gemini_Flash.addToQueue(userInput);
}
