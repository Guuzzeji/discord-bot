import 'dotenv/config';

import { initializeDiscordClient } from "./src/Client";
import { registerCommands } from './src/commands/registerCommands';
import { registerMessageCreateEvent } from './src/events/registerCreateMessageEvent';

// Run server
(async () => {
    initializeDiscordClient();
    registerMessageCreateEvent()
    await registerCommands();
})()