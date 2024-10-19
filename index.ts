import 'dotenv/config';

import { startClient } from "./src/Client";
import { registerCommands } from './src/commands/registerCommands';
import { registerMessageHandler } from './src/events/registerMessageHandler';

// Run server
(async () => {
    startClient();
    registerMessageHandler()
    await registerCommands();
})()