import { ChannelType, Message, type OmitPartialGroupDMChannel, type PublicThreadChannel } from "discord.js";
import GeminiFlash from "../../llm/GeminiFlash";
import { getEnvVar } from "../../utils";
import type { ChatItem } from "../../llm/InputLLMItem";

export default async function PromptMessage(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (msg.channel.type === ChannelType.PublicThread && msg.channel.ownerId === getEnvVar("CLIENT_ID") && msg.author.id !== getEnvVar("CLIENT_ID")) {
        const threadTitle = msg.channel.name;
        if (threadTitle?.includes("[AI CHAT]")) {
            const originalMessage = await msg.channel.send("Waiting for AI to respond...");
            await GeminiFlash.addToQueue({
                threadMessage: originalMessage,
                prompt: msg.content,
                chatHistory: await createChatHistory(msg.channel),
                skips: 0
            });
        }
    }
}


async function createChatHistory(channel: PublicThreadChannel<boolean>): Promise<ChatItem[]> {
    const messages = await channel.messages.fetch({ limit: 5 });
    const chatHistory = [];

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
