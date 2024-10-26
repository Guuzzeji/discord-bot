import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { getEnvVar } from "../utils";

import type { InputLLMItem } from "./InputLLMItem";
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

const MODEL = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 2048,
    apiKey: getEnvVar("GEMINI_API_KEY"),
    temperature: 0.7,
});

export default class GeminiFlash {
    /**
     * https://cookbook.openai.com/examples/how_to_handle_rate_limits
     * https://js.langchain.com/v0.1/docs/modules/data_connection/text_embedding/rate_limits/
     * https://v03.api.js.langchain.com/interfaces/_langchain_google_genai.GoogleGenerativeAIChatInput.html#maxConcurrency
     * https://js.langchain.com/v0.1/docs/modules/data_connection/text_embedding/rate_limits/
     * https://www.youtube.com/watch?v=FRNIYJd_LCs
     * https://ai.google.dev/pricing#1_5flash
     * https://js.langchain.com/docs/tutorials/llm_chain
     * https://old.discordjs.dev/#/docs/discord.js/main/class/Message
     */

    private static queue: InputLLMItem[] = [];

    private static readonly SYSTEM_PROMPT = "You are a helpful AI assistant. Always think before responding to the user!";

    private static readonly MAX_REQUESTS_PER_MINUTE = 15;
    private static readonly MAX_TOKEN_PER_MINUTE = 1000000;
    private static readonly MAX_REQUESTS_PER_DAY = 1500;

    private static readonly REQUEST_RATE_SECONDS = 3;
    private static readonly QUEUE_RATE_LIMIT_CHECK_SECONDS = 1;

    private static readonly MAX_SKIPS_PER_REQUEST = 3;

    private static pauseQueueMinutes = false;
    private static pauseQueueDays = false;

    private static requestCounterMinute = 0;
    private static requestCounterDay = 0;
    private static tokenCounterMinute = 0;

    private static isQueueCheckRunning = false;

    // TODO: Add discord object to response back
    public static async addToQueue(userInput: InputLLMItem) {
        GeminiFlash.queue.push(userInput);
        GeminiFlash.processQueue();
    }

    private static formatLLMInput(input: InputLLMItem): BaseMessage[] {
        const llmChatHistory = [];
        llmChatHistory.push(new SystemMessage({
            content: GeminiFlash.SYSTEM_PROMPT
        }))

        for (const chatMsg of input.chatHistory) {
            if (chatMsg.isHuman) {
                llmChatHistory.push(new HumanMessage({
                    content: chatMsg.message
                }));
            } else {
                llmChatHistory.push(new AIMessage({
                    content: chatMsg.message
                }));
            }
        }

        llmChatHistory.push(new HumanMessage({
            content: input.prompt
        }));

        return llmChatHistory;
    }

    private static processQueue() {
        if (GeminiFlash.isQueueCheckRunning) {
            return;
        }

        GeminiFlash.isQueueCheckRunning = true;
        GeminiFlash.queueLimitChecks();
        GeminiFlash.queueRateLimitReset();
        GeminiFlash.processQueueItem();
    }

    private static processQueueItem() {
        setInterval(async () => {
            console.log(`Request: ${GeminiFlash.requestCounterMinute} | Token: ${GeminiFlash.tokenCounterMinute} | Queue: ${GeminiFlash.queue.length}`);
            if (GeminiFlash.queue.length > 0 && !GeminiFlash.pauseQueueMinutes && !GeminiFlash.pauseQueueDays) {
                const task = GeminiFlash.queue.shift();
                // console.log(task);

                if (!task) {
                    return;
                }

                await task.threadMessage.edit("Processing...");

                if (task.skips >= GeminiFlash.MAX_SKIPS_PER_REQUEST) {
                    await task.threadMessage.edit("Too many skips. Cancelling Request. Please Try Again.");
                    return
                }

                const chatHistory = GeminiFlash.formatLLMInput(task);
                console.log(chatHistory);

                try {
                    const modelResponse = await MODEL.invoke(chatHistory);
                    await task.threadMessage.edit(modelResponse.content as string);

                    GeminiFlash.requestCounterMinute++;
                    GeminiFlash.requestCounterDay++;
                    GeminiFlash.tokenCounterMinute += modelResponse.usage_metadata?.total_tokens || 0;

                } catch (error) {
                    task.skips++;
                    GeminiFlash.queue.push(task);
                    console.log(error);
                }
            }
        }, 1000 * GeminiFlash.REQUEST_RATE_SECONDS);
    }

    // TODO: Add update function
    private static queueLimitChecks() {
        if (!GeminiFlash.pauseQueueMinutes && !GeminiFlash.pauseQueueDays) {
            setInterval(() => {
                if (GeminiFlash.requestCounterDay >= GeminiFlash.MAX_REQUESTS_PER_DAY) {
                    console.log("Max requests per day reached. Pausing queue.");
                    GeminiFlash.pauseQueueDays = true;
                }

                if (GeminiFlash.requestCounterMinute >= GeminiFlash.MAX_REQUESTS_PER_MINUTE) {
                    console.log("Max requests per minute reached. Pausing queue.");
                    GeminiFlash.pauseQueueMinutes = true;
                }

                if (GeminiFlash.tokenCounterMinute >= GeminiFlash.MAX_TOKEN_PER_MINUTE) {
                    console.log("Max token per minute reached. Pausing queue.");
                    GeminiFlash.pauseQueueMinutes = true;
                }

                GeminiFlash.queueCoolDown();
            }, 1000 * GeminiFlash.QUEUE_RATE_LIMIT_CHECK_SECONDS);
        }
    }

    // TODO: Add trigger for when queue is paused (cool down timer)
    private static queueCoolDown() {
        if (GeminiFlash.pauseQueueMinutes) {
            setTimeout(function () {
                GeminiFlash.pauseQueueMinutes = false;
                GeminiFlash.tokenCounterMinute = 0;
                GeminiFlash.requestCounterMinute = 0;
            }, 1000 * 60);
        }

        if (GeminiFlash.pauseQueueDays) {
            setTimeout(function () {
                GeminiFlash.pauseQueueDays = false;
                GeminiFlash.pauseQueueMinutes = false;
                GeminiFlash.tokenCounterMinute = 0;
                GeminiFlash.requestCounterMinute = 0;
                GeminiFlash.requestCounterDay = 0;
            }, 1000 * 60 * 60 * 24);
        }
    }

    private static queueRateLimitReset() {
        setTimeout(function () {
            if (!GeminiFlash.pauseQueueMinutes) {
                GeminiFlash.tokenCounterMinute = 0;
                GeminiFlash.requestCounterMinute = 0;
            }
        }, 1000 * 60);

        setTimeout(function () {
            if (!GeminiFlash.pauseQueueDays) {
                GeminiFlash.tokenCounterMinute = 0;
                GeminiFlash.requestCounterMinute = 0;
                GeminiFlash.requestCounterDay = 0;
            }
        }, 1000 * 60 * 60 * 24);
    }
}
