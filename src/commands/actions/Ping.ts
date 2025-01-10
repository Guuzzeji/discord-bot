import { SlashCommandBuilder } from 'discord.js';

import type { SlashAction } from '../../types/SlashAction';
import type { ChatInputCommandInteraction } from 'discord.js'

/**
 * Used to test if bot is working and is example of how to do bot actions
 */
export const Ping: SlashAction = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Reply with Pong! HAPPY"),

    async executeCommand(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    }
};
