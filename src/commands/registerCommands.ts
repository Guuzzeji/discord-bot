import { REST, Routes, Events } from "discord.js";

import type { ChatInputCommandInteraction, Interaction } from "discord.js";

import { CLIENT } from "../client/index";
import { COMMAND_LIST, COMMAND_METADATA } from './CommandList';
import { getEnvVar } from '../utils';

export async function registerCommands() {

    CLIENT.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            const chatInputInteraction = interaction as ChatInputCommandInteraction;
            COMMAND_LIST.get(chatInputInteraction.commandName)?.executeCommand(chatInputInteraction);
        }
    });

    const REST_API = new REST({ version: "10" }).setToken(getEnvVar("DISCORD_BOT_TOKEN"));

    try {
        if (getEnvVar("PROD") !== "") {
            await REST_API.put(
                Routes.applicationCommands(
                    getEnvVar("CLIENT_ID"),
                ),
                { body: COMMAND_METADATA }
            );
        } else {
            await REST_API.put(
                Routes.applicationGuildCommands(
                    getEnvVar("CLIENT_ID"),
                    getEnvVar("SERVER_ID")
                ),
                { body: COMMAND_METADATA }
            );
        }

        console.log("Successfully registered application commands.");

    } catch (error) {
        console.error(error);
    }
}