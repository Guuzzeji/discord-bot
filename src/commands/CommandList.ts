import { Ping } from './actions/Ping';
import { NewChat } from './actions/NewChat';

import type { BotCommandAction } from './types/BotCommandAction';

export const COMMAND_METADATA = [
    Ping.data.toJSON(),
    NewChat.data.toJSON(),
]

export const COMMAND_LIST = new Map<string, BotCommandAction>([
    [Ping.data.name, Ping],
    [NewChat.data.name, NewChat],
])
