import 'dotenv/config';

import { initializeDiscordClient } from "./src/Client";
import { registerCommands } from './src/commands/registerCommands';
import { registerMessageCreateEvent } from './src/events/registerCreateMessageEvent';
import { getEnvVar, logger } from './src/utils';

/**
 * All required environment variables
 */
const REQUIRED_ENV_VARS = [
    "DISCORD_BOT_TOKEN",
    "CLIENT_ID",
    "SERVER_ID",
    "GEMINI_API_KEY",
    "PROD",
] as const;

/**
 * Checks if all required environment variables are loaded into the process.
 *
 * Throws an error if any required environment variable is not present.
 */
function checkEnvVars(): void {
    // Iterate over the list of required environment variables
    REQUIRED_ENV_VARS.forEach((varName) => {
        // Check if the environment variable is present
        if (getEnvVar(varName) === "") {
            // Throw an error if the variable is not present
            throw new Error(`Missing environment variable: ${varName}`);
        }
    });
}

// Run server
(async () => {
    try {
        checkEnvVars();
        initializeDiscordClient();
        registerMessageCreateEvent()
        await registerCommands();
    } catch (e: unknown) {
        logger.error(e)
        process.exit(1) // exit out with error
    }
})()