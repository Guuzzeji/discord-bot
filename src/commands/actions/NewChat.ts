import { SlashCommandBuilder } from 'discord.js';

import type { BotAction } from '../../types/BotAction';
import type { ChatInputCommandInteraction } from 'discord.js'

export const NewChat: BotAction = {
    data: new SlashCommandBuilder()
        .setName("newchat")
        .setDescription("Create a new ai chat")
        .addStringOption(
            option => option
                .setName("prompt")
                .setDescription("The prompt to use")
                .setRequired(true)
                .setMinLength(1)
        ),

    async executeCommand(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`### ==CREATING NEW CHAT==\n**Prompt**: ${interaction.options.getString("prompt")}\n**By**: <@${interaction.user.id}>`);
    }
};
