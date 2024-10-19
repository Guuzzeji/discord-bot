import { SlashCommandBuilder } from 'discord.js';

import type { BotAction } from '../types/BotAction';
import type { ChatInputCommandInteraction } from 'discord.js'

export const Ping: BotAction = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Reply with Pong! HAPPY"),

    async executeCommand(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    }
};
