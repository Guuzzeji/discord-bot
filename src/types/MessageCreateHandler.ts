import type { Message, OmitPartialGroupDMChannel } from "discord.js";

/**
 * A MessageCreateHandler is a function that is called whenever a message is sent in the Discord server.
 * It is given the message as an argument and should return a promise that resolves when the function is complete.
 * The function should not throw any errors, but instead should handle any errors that may occur internally.
 * The function is expected to modify the message or send a new message in response to the original message.
 * @param {OmitPartialGroupDMChannel<Message<boolean>>} msg The message that was sent.
 * @returns {Promise<void>} A promise that resolves when the function is complete.
 */
export type MessageCreateHandler = (msg: OmitPartialGroupDMChannel<Message<boolean>>) => Promise<void>;