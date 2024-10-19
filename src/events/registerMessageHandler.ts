import { Events, ChannelType } from "discord.js";

import { CLIENT } from "../Client";
import { getEnvVar } from "../utils";

export function registerMessageHandler() {
    CLIENT.on(Events.MessageCreate, async msg => {
        console.log("message", msg.channelId);

        if (msg.author.id === getEnvVar("CLIENT_ID")) {

            // console.log("MESSAGE CONTENTS -->", msg.content);
            // console.log("MESSAGE CONTENTS -->", msg.attachments);

            if (msg.content.includes("CREATING NEW CHAT")
                && msg.thread === null
                && msg.channel.type !== ChannelType.PublicThread) {

                const regexPrompt = /\*\*Prompt\*\*: (.+)/;
                const matchPrompt = msg.content.match(regexPrompt);
                const prompt = matchPrompt === null ? "No prompt provided" : matchPrompt[1];

                const regexUsername = /\*\*By\*\*: (.+)/
                const matchUsername = msg.content.match(regexUsername);
                const username = matchUsername === null ? "No username provided" : matchUsername[1];


                const thread = await msg.startThread({
                    name: `[AI CHAT] -- ${prompt.slice(0, 20)}...`,
                    autoArchiveDuration: 60
                });

                thread.send(`Hello @${username}!`);
            }
        }

        if (msg.channel.type === ChannelType.PublicThread && msg.author.id !== getEnvVar("CLIENT_ID")) {
            console.log("THREAD CONTENTS -->", msg.channel.name);
            msg.channel.send("We are in a thread now");
        }
    });
}