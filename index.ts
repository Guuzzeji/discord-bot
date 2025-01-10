require('dotenv').config();
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY);

import { initializeDiscordClient } from "./src/Client";
import { registerCommands } from './src/commands/registerCommands';
import { registerMessageCreateEvent } from './src/events/registerCreateMessageEvent';

// Run server
(async () => {
    initializeDiscordClient();
    registerMessageCreateEvent()
    await registerCommands();
})()