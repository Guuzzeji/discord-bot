import { SlashCommandBuilder } from 'discord.js';
import type { Interaction, SlashCommandOptionsOnlyBuilder } from 'discord.js'

export type BotAction = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    executeCommand(interaction: Interaction): Promise<void>,
}