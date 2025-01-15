import CreateNewChat from "./actions/CreateNewChat";
import PromptMessage from "./actions/PromptMessage";

import type { MessageCreateHandler } from "../types/MessageCreateHandler";

/**
 * List of all message actions. Used to register them in the message handler
 */
export const MESSAGE_ACTIONS: MessageCreateHandler[] = [
    CreateNewChat,
    PromptMessage
];
