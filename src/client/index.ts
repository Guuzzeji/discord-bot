import {
    Client,
    GatewayIntentBits,
    Events
} from "discord.js";

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

export function startClient() {
    CLIENT.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    CLIENT.login(process.env.DISCORD_BOT_TOKEN);
}


