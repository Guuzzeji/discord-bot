import 'dotenv/config';
import { REST, Routes, Events } from "discord.js";

import { CLIENT } from "../Client";
import { COMMAND_LIST, COMMAND_METADATA } from './CommandList';
import { getEnvVar, logger } from '../utils';

import type { ChatInputCommandInteraction, Interaction } from "discord.js";

/**
 * Registers all commands in the COMMAND_LIST with the Discord API.
 * This needs to be done before the bot can receive any interactions.
 * The commands are registered under the bot's id, and the server id if it exists.
 * If the PROD environment variable is set, the commands are registered globally,
 * otherwise they are registered only for the server with the id in SERVER_ID.
 * @returns {Promise<void>}
 */
export async function registerCommands() {
    // This is the event that is trigger whenever a user does a /command
    CLIENT.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            const chatInputInteraction = interaction as ChatInputCommandInteraction;
            COMMAND_LIST.get(chatInputInteraction.commandName)?.executeCommand(chatInputInteraction);
        }
    });

    // This is used to register the commands so it will be shown in the command panel
    const REST_API = new REST({ version: "10" }).setToken(getEnvVar("DISCORD_BOT_TOKEN"));
    try {
        // PROD = production
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
        logger.info("Successfully registered application commands.");
    } catch (error) {
        logger.error(error);
    }
}