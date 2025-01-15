import { LLMQueueProcessor } from "../LLMQueueProcessor";
import { RateLimitFileManger } from "../RateLimitFileManger";
import { logger, dateDifferenceByDays, dateDifferenceByMinutes } from "../../utils";

import type { LLMQueueProcessorOptions } from "../../types/LLMQueueProcessorOptions";
import type { BaseMessage, AIMessageChunk } from "@langchain/core/messages";
import type { RateLimitInformation } from "../../types/RateLimitInformation";
import type { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * A GeminiFlash is a LLMQueueProcessor that uses the Gemini Flash model.
 */
export default class GeminiFlashQueueProcessor extends LLMQueueProcessor {

    /**
     * Used for calling the model from langchain object
     */
    private modelCaller: ChatGoogleGenerativeAI;

    /**
     * The file name for the rate limit file
     */
    private rateLimitFileName: string;

    /**
     * Constructs a new GeminiFlash instance with the specified parameters.
     * @param {LLMQueueProcessorOptions} params - The configuration options for the processor.
     */
    constructor(params: LLMQueueProcessorOptions, modelCaller: ChatGoogleGenerativeAI, rateLimitFileName: string) {
        super(params);
        this.modelCaller = modelCaller;
        this.rateLimitFileName = rateLimitFileName;
    }

    protected async invokeModel(chatHistory: BaseMessage[]): Promise<AIMessageChunk> {
        return await this.modelCaller.invoke(chatHistory);
    }

    public loadRateLimits(): void {
        logger.info("Loading Gemini Flash rate limits");
        const lastLimits = RateLimitFileManger.loadRates<RateLimitInformation>(this.rateLimitFileName);

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

            // Grabbing the current time and loading in from last saved
            RateLimitFileManger.saveRates(this.rateLimitFileName, JSON.stringify({
                lastTime: new Date().toUTCString(),
                pauseQueueMinutes: this.pauseQueueMinutes,
                pauseQueueDays: this.pauseQueueDays,
                requestCounterMinute: this.requestCounterMinute,
                requestCounterDay: this.requestCounterDay,
                tokenCounterMinute: this.tokenCounterMinute
            }))
        }

        /**
         * Below on node base events handles to doe specific actions when the server crashes or exits
         */

        // On exit events
        process.on('exit', () => {
            saveDataToStorage();
        });

        // Use for when Ctrl + C is pressed
        process.on('SIGINT', () => {
            process.exit(0);
        });

        // Error handling
        process.on('uncaughtException', () => {
            process.exit(1);
        });
    }
}
