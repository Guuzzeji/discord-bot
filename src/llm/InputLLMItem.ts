import type { Message } from "discord.js";

export type ChatItem = {
    message: string;
    isHuman: boolean;
}

export type InputLLMItem = {
    skips: 0,
    threadMessage: Message<true>;
    prompt: string;
    chatHistory: ChatItem[];
}