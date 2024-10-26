import { Events } from "discord.js";

import { CLIENT } from "../Client";
import { MESSAGE_ACTIONS } from "./MessageActions";

/**
 * Registers a message handler that listens for message creation events.
 * When a message is created, it iterates over all defined message actions
 * and executes them asynchronously.
 */
export function registerCreateMessageEvent() {
    CLIENT.on(Events.MessageCreate, async msg => {
        for (const action of MESSAGE_ACTIONS) {
            await action(msg);
        }
    });
}
