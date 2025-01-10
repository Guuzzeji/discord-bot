import type { Message } from "discord.js";

/**
 * Represents a chat item in the AI chat history.
 * Contains the message content and a flag indicating if the message is from a human.
 */
export type AIChatItem = {
    /** The content of the chat message. */
    message: string;

    /** Indicates whether the message is from a human (true) or AI (false). */
    isHuman: boolean;
}

/**
 * Represents the input required for processing an AI chat.
 * Includes the prompt, chat history, and associated metadata for the chat thread.
 */
export type AIChatInput = {
    /** The number of times the current task has been skipped in the processing queue. */
    skips: number;

    /** The message object representing the thread in which the chat is taking place. */
    threadMessage: Message<true>;

    /** The initial prompt provided by the user to start the AI chat. */
    prompt: string;

    /** The history of chat items exchanged in the conversation. */
    chatHistory: AIChatItem[];
}
