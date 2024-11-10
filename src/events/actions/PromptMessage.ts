import { ChannelType, Message } from "discord.js";

import { callGeminiFlash } from "../../llm/Gemini/callGeminiFlash";
import { getEnvVar } from "../../utils";

import type { AIChatItem } from "../../types/AIChatInput";
import type { OmitPartialGroupDMChannel, PublicThreadChannel } from "discord.js";

const CHAT_HISTORY_MESSAGE_LIMIT = 5;

/**
 * Handles new messages in a public thread channel owned by the bot.
 * Checks that the message is not from the bot and that the thread is an AI chat.
 * If the message passes these checks, it constructs the chat history for the thread and adds
 * the message to the LLM queue.
 * @param msg - The message to handle.
 */
export default async function PromptMessage(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    // Check that the thread is from the bot and the message is not from the bot
    if (msg.channel.type === ChannelType.PublicThread &&
        msg.channel.ownerId === getEnvVar("CLIENT_ID") &&
        msg.author.id !== getEnvVar("CLIENT_ID")) {

        // Do another check to make sure that thread is for AI chat
        const threadTitle = msg.channel.name;
        if (threadTitle?.includes("[AI CHAT]")) {

            // Creating message
            const originalMessage = await msg.channel.send("Waiting for AI to respond...");
            await callGeminiFlash({
                threadMessage: originalMessage,
                prompt: msg.content,
                chatHistory: await createChatHistory(msg.channel),
                skips: 0
            });
        }
    }
}


/**
 * Constructs the chat history for a given public thread channel.
 * Fetches the most recent CHAT_HISTORY_MESSAGE_LIMIT messages from the channel and formats them into an array of AIChatItem objects.
 * Determines whether each message is from the AI or a human based on the author ID.
 *
 * @param channel - The public thread channel from which to fetch chat history.
 * @returns A Promise that resolves to an array of AIChatItem objects representing the chat history.
 */
async function createChatHistory(channel: PublicThreadChannel<boolean>): Promise<AIChatItem[]> {
    const messages = await channel.messages.fetch({ limit: CHAT_HISTORY_MESSAGE_LIMIT });
    const chatHistory = [];

    // * NOTE: Messages are store in a weird tuple for some reason so it [string, Message]
    for (const message of messages) {
        if (message[1].author.id === getEnvVar("CLIENT_ID")) {
            chatHistory.push({
                message: message[1].content,
                isHuman: false
            })
        } else {
            chatHistory.push({
                message: message[1].content,
                isHuman: true
            })
        }
    }

    return chatHistory.reverse();
}
