import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";

import { GEMINI_MODEL_CALLER, RATE_LIMIT_FILE_NAME } from "./Model";
import { LLMQueueProcessor } from "../LLMQueueProcessor";
import { dateDifferenceByDays, dateDifferenceByMinutes, logger } from "../../utils";

import type { LLMQueueProcessorOptions } from "../../types/LLMQueueProcessorOptions";
import { loadLastRateLimitsFromStorage, saveRateLimitsToStorage } from "../saveRateLimit";
import type { RateLimitInformation } from "../../types/RateLimitInformation";

/**
 * A GeminiFlash is a LLMQueueProcessor that uses the Gemini Flash model.
 */
export class GeminiFlash extends LLMQueueProcessor {
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
        return await GEMINI_MODEL_CALLER.invoke(chatHistory);
    }

    public loadRateLimits(): void {
        logger.info("Loading Gemini Flash rate limits");
        const lastLimits = loadLastRateLimitsFromStorage<RateLimitInformation>(RATE_LIMIT_FILE_NAME);

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
            saveRateLimitsToStorage(RATE_LIMIT_FILE_NAME, JSON.stringify({
                lastTime: new Date().toUTCString(),
                pauseQueueMinutes: this.pauseQueueMinutes,
                pauseQueueDays: this.pauseQueueDays,
                requestCounterMinute: this.requestCounterMinute,
                requestCounterDay: this.requestCounterDay,
                tokenCounterMinute: this.tokenCounterMinute
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
