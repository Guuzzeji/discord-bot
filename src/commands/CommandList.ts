import { Ping } from './actions/Ping';
import { NewChat } from './actions/NewChat';

import type { BotAction } from './types/BotAction';

export const COMMAND_METADATA = [
    Ping.data.toJSON(),
    NewChat.data.toJSON(),
]

export const COMMAND_LIST = new Map<string, BotAction>([
    [Ping.data.name, Ping],
    [NewChat.data.name, NewChat],
])
