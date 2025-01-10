console.log('GOOGLE_API_KEY from process.env:', process.env.GOOGLE_API_KEY);

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getEnvVar } from "../../utils";

/**
 * This file is for storing model information for the Gemini model. As well as the caller for the model.
 */
export const GEMINI_MODEL_CALLER = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 1000,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
});

// ! NOTE: Discord has a 2000 character limit on messages, please keep this below 2000
export const SYSTEM_PROMPT = `
# Role
You are a helpful AI assistant. Always think before responding to the user! 

# Response
Keep you response short and to the point. About 500 words max.
`;

export const MAX_REQUESTS_PER_MINUTE = 15;
export const MAX_TOKEN_PER_MINUTE = 1000000;
export const MAX_REQUESTS_PER_DAY = 1500;
export const REQUEST_RATE_SECONDS = 3;
export const QUEUE_RATE_LIMIT_CHECK_SECONDS = 1;
export const MAX_SKIPS_PER_REQUEST = 3;
export const RATE_LIMIT_FILE_NAME = "GoogleGenAI.json";