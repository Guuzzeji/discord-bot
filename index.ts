import 'dotenv/config';

import { initializeDiscordClient } from "./src/Client";
import { registerCommands } from './src/commands/registerCommands';
import { registerCreateMessageEvent } from './src/events/registerCreateMessageEvent';

// Run server
(async () => {
    initializeDiscordClient();
    registerCreateMessageEvent()
    await registerCommands();
})()