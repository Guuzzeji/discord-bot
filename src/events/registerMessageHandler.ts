import { Events, Message, type OmitPartialGroupDMChannel } from "discord.js";

import { CLIENT } from "../Client";
import CreateNewChat from "./actions/CreateNewChat";
import PromptMessage from "./actions/PromptMessage";


// TODO: Refactor this into a function and command with AI
// TODO: Save thread ids to db to make sure we are chatting in a thread
// TODO: Add logger
// TODO: Add queue for AI prompting
// TODO: Queue should be a class base and rate limit base on token, time, request 
// TODO: Remove channel stuff in .env (don't need that as admin can force which channel to use)
// TODO: Create git actions for deploy, testing, liniting

/**
 * ! NOTE:
 * https://www.npmjs.com/package/sql.js
 * https://stackoverflow.com/questions/63863871/discord-py-how-to-go-through-channel-history-and-search-for-a-specific-message
 * https://www.highlight.io/blog/nodejs-logging-libraries
 * https://python.langchain.com/docs/integrations/providers/google/
 * https://ai.google.dev/pricing#1_0pro
 * https://stackoverflow.com/questions/70915905/discordjs-create-thread-for-bots-own-message
 * https://stackoverflow.com/questions/2924330/how-can-i-rate-limit-how-fast-a-javascript-function-allows-itself-to-be-called
 * https://ai.google.dev/gemini-api/docs/tokens?lang=node
 * https://github.com/nektos/act?tab=readme-ov-file
 * https://discordjs.guide/slash-commands/advanced-creation.html#adding-options
 * https://stackoverflow.com/questions/71910949/how-do-i-mention-a-person-using-discord-js-with-only-the-user-id
 * https://old.discordjs.dev/#/docs/discord.js/14.13.0/class/ThreadChannel?scrollTo=client
 *  Note: can also use client to see if bot made thread or not
 * 
 * https://www.youtube.com/watch?v=2c7LlU0VOk0
 * https://www.npmjs.com/package/eslint-plugin-spellcheck
 * https://typescript-eslint.io/getting-started
 */

type MessageAction = (msg: OmitPartialGroupDMChannel<Message<boolean>>) => Promise<void>;

const messageActions: MessageAction[] = [CreateNewChat, PromptMessage];

export function registerMessageHandler() {
    CLIENT.on(Events.MessageCreate, async msg => {
        console.log("message", msg.channelId);

        for (const action of messageActions) {
            await action(msg);
        }
    });
}
