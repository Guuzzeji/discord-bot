import { ChannelType, Message, type OmitPartialGroupDMChannel } from "discord.js";
import { getEnvVar } from "../../utils";
import GeminiFlash from "../../llm/GeminiFlash";

export default async function CreateNewChat(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    const matchPrompt = msg.content.match(/\*\*Prompt\*\*: (.+)/);
    const prompt = matchPrompt === null ? "No prompt provided" : matchPrompt[1];

    if (msg.author.id === getEnvVar("CLIENT_ID")) {
        if (msg.content.includes("CREATING NEW CHAT") && msg.channel.type !== ChannelType.PublicThread) {
            const thread = await msg.startThread({
                name: `[AI CHAT] -- ${prompt.slice(0, 20)}...`,
                autoArchiveDuration: 60
            });

            const originalMessage = await thread.send("Waiting for AI to respond...");

            GeminiFlash.addToQueue({
                threadMessage: originalMessage,
                prompt: prompt,
                chatHistory: [],
                skips: 0
            });
        }
    }
}