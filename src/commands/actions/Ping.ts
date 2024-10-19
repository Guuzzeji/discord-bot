import { SlashCommandBuilder } from 'discord.js';

import type { BotCommandAction } from '../types/BotCommandAction';
import type { ChatInputCommandInteraction } from 'discord.js'

export const Ping: BotCommandAction = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Reply with Pong! HAPPY"),

    async executeCommand(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    }
};
