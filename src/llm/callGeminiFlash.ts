import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";

import { LLMQueueProcessor } from "./LLMQueueProcessor";
import { getEnvVar } from "../utils";

import type { AIChatInput } from "../types/AIChatInput";
import type { LLMQueueProcessorOptions } from "../types/LLMQueueProcessorOptions";

const MODEL = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 2048,
    apiKey: getEnvVar("GEMINI_API_KEY"),
    temperature: 0.7,
});

const SYSTEM_PROMPT = "You are a helpful AI assistant. Always think before responding to the user!";
const MAX_REQUESTS_PER_MINUTE = 15;
const MAX_TOKEN_PER_MINUTE = 1000000;
const MAX_REQUESTS_PER_DAY = 1500;
const REQUEST_RATE_SECONDS = 3;
const QUEUE_RATE_LIMIT_CHECK_SECONDS = 1;
const MAX_SKIPS_PER_REQUEST = 3;

class GeminiFlash extends LLMQueueProcessor {
    constructor(params: LLMQueueProcessorOptions) {
        super(params);
    }

    protected async invokeModel(chatHistory: BaseMessage[]): Promise<AIMessageChunk> {
        return await MODEL.invoke(chatHistory);
    }
}

const geminiFlashModel = new GeminiFlash({
    systemPrompt: SYSTEM_PROMPT,
    maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
    maxTokenPerMinute: MAX_TOKEN_PER_MINUTE,
    maxRequestsPerDay: MAX_REQUESTS_PER_DAY,
    requestRateSeconds: REQUEST_RATE_SECONDS,
    queueRateLimitCheckSeconds: QUEUE_RATE_LIMIT_CHECK_SECONDS,
    maxSkipsPerRequest: MAX_SKIPS_PER_REQUEST
});

export async function callGeminiFlash(userInput: AIChatInput) {
    await geminiFlashModel.addToQueue(userInput);
}
