import 'dotenv/config';
import { ChannelType, Message, } from "discord.js";

import GeminiFlash from "../../llm/Gemini/GeminiFlash";
import { getEnvVar } from "../../utils";

import type { OmitPartialGroupDMChannel } from "discord.js";

/**
 * Creates a new AI chat thread if the given message is from the bot and not already part of an AI chat thread.
 * Extracts the prompt from the message and uses it to name the new thread. 
 * Sends an initial message in the thread and adds the chat to the LLM queue for processing.
 * 
 * @param msg - The message object from which to derive the chat prompt and create the thread.
 */
export default async function CreateNewChat(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    // Parse prompt from bot message
    const matchPrompt = msg.content.match(/\*\*Prompt\*\*: (.+)/);
    const prompt = matchPrompt === null ? "No prompt provided" : matchPrompt[1];

    // Check that message is from the bot and that the message is NOT a AI Chat thread
    if (msg.author.id === getEnvVar("CLIENT_ID") &&
        msg.content.includes("CREATING NEW CHAT") &&
        msg.channel.type !== ChannelType.PublicThread) {

        // Create thread
        const thread = await msg.startThread({
            name: `[AI CHAT] -- ${prompt.slice(0, 20)}...`,
            autoArchiveDuration: 60
        });

        const originalMessage = await thread.send("Waiting for AI to respond...");
        await GeminiFlash.addToQueue({
            threadMessage: originalMessage,
            prompt: prompt,
            chatHistory: [],
            skips: 0
        });
    }
}