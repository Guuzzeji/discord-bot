import { Ping } from './actions/ping';
import { NewChat } from './actions/NewChat';

import type { BotCommandAction } from './types/BotCommandAction';

export const COMMAND_METADATA = [
    Ping.data.toJSON(),
    NewChat.data.toJSON(),
]

export const COMMAND_LIST = new Map<string, BotCommandAction>([
    ["ping", Ping],
    ["newchat", NewChat],
])
