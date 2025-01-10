import { Ping } from './actions/Ping';
import { NewChat } from './actions/NewChat';

import type { SlashAction } from '../types/SlashAction';

/**
 * This is a list of all commands. used for registering it so it will show in the discord command panel
 */
export const COMMAND_METADATA = [
    Ping.data.toJSON(),
    NewChat.data.toJSON(),
]

/**
 * This is a list of all commands that will be used when looking up commands when event is called
 */
export const COMMAND_LIST = new Map<string, SlashAction>([
    [Ping.data.name, Ping],
    [NewChat.data.name, NewChat],
])
