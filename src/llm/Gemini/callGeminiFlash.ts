import { GeminiFlash } from "./GeminiFlash";
import {
    MAX_REQUESTS_PER_DAY,
    MAX_REQUESTS_PER_MINUTE,
    MAX_SKIPS_PER_REQUEST,
    MAX_TOKEN_PER_MINUTE,
    QUEUE_RATE_LIMIT_CHECK_SECONDS,
    REQUEST_RATE_SECONDS,
    SYSTEM_PROMPT
} from "./Metadata";

import type { AIChatInput } from "../../types/AIChatInput";

/**
 * Create a new Gemini Flash instance with queue + rate limiting
 */
export const Gemini = new GeminiFlash({
    systemPrompt: SYSTEM_PROMPT,
    maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
    maxTokenPerMinute: MAX_TOKEN_PER_MINUTE,
    maxRequestsPerDay: MAX_REQUESTS_PER_DAY,
    requestRateSeconds: REQUEST_RATE_SECONDS,
    queueRateLimitCheckSeconds: QUEUE_RATE_LIMIT_CHECK_SECONDS,
    maxSkipsPerRequest: MAX_SKIPS_PER_REQUEST
});

// Load rate limit data
Gemini.loadRateLimits();
Gemini.saveRateLimits();

/**
 * Adds a user input to the Gemini Flash queue and initiates queue processing.
 * @param {AIChatInput} userInput - The chat input to add to the queue.
 */
export async function callGeminiFlash(userInput: AIChatInput) {
    await Gemini.addToQueue(userInput);
}
