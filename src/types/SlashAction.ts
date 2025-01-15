import { SlashCommandBuilder } from 'discord.js';

import type { Interaction, SlashCommandOptionsOnlyBuilder } from 'discord.js'

/**
 * Represents a single slash command action. The action consists of the slash command
 * builder and an executeCommand function that is called when the slash command is
 * invoked.
 *
 * @typedef {Object} SlashAction
 * @property {SlashCommandBuilder | SlashCommandOptionsOnlyBuilder} data - The slash
 * command builder. This is used to register the slash command with Discord.
 * @property {(interaction: Interaction) => Promise<void>} executeCommand - The
 * executeCommand function is called when the slash command is invoked. It should
 * handle the interaction and any other logic that is needed.
 *
 * @example
 * const ping: SlashAction = {
 *     data: new SlashCommandBuilder()
 *         .setName('ping')
 *         .setDescription('Replies with Pong!'),
 *     executeCommand(interaction) {
 *         interaction.reply('Pong!');
 *     },
 * };
 */
export type SlashAction = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    executeCommand(interaction: Interaction): Promise<void>,
}