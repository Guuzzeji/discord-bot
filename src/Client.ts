import { Client, GatewayIntentBits, Events } from "discord.js";

import { logger } from "./utils";

/**
 * Create a new Discord Client instance
 */
export const CLIENT = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

/**
 * Initializes the Discord client by logging in and setting up the ready event.
 * The ready event is used to log a success message to the console when the
 * bot is fully connected and ready to receive events.
 */
export function initializeDiscordClient() {
    CLIENT.once(Events.ClientReady, readyClient => {
        logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
    });
    CLIENT.login(process.env.DISCORD_BOT_TOKEN);
}


