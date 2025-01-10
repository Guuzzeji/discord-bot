import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import GeminiFlashQueueProcessor from "./GeminiFlashQueueProcessor";
import { getEnvVar } from '../../utils';

/**
 * This file is for storing model information for the Gemini model. As well as the caller for the model.
 */
const GEMINI_MODEL_CALLER = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 1000,
    apiKey: getEnvVar("GEMINI_API_KEY"),
    temperature: 0.7,
});

// Rate limit file
const RATE_LIMIT_FILE_NAME = "google-gen-ai-rate-limits.json";

/**
 * Create a new Gemini Flash instance with queue + rate limiting
 */
export const GeminiFlash = new GeminiFlashQueueProcessor({
    systemPrompt: `
    # Role
    You are a helpful AI assistant. Always think before responding to the user! 

    # Response
    Keep you response short and to the point. About 500 words max.`,
    maxRequestsPerMinute: 15,
    maxTokenPerMinute: 1000000,
    maxRequestsPerDay: 1500,
    requestRateSeconds: 3,
    queueRateLimitCheckSeconds: 3,
    maxSkipsPerRequest: 10,
},
    GEMINI_MODEL_CALLER,
    RATE_LIMIT_FILE_NAME
);

// Load rate limit data
GeminiFlash.loadRateLimits();
GeminiFlash.saveRateLimits();


