import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getEnvVar } from "../../utils";
import { GeminiFlash } from "./GeminiFlash";

/**
 * This file is for storing model information for the Gemini model. As well as the caller for the model.
 */

export const GEMINI_MODEL_CALLER = new ChatGoogleGenerativeAI({
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
export const RATE_LIMIT_FILE_NAME = "GoogleGenAI.json";

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
