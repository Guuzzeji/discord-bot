import type { AIChatInput } from "../../types/AIChatInput";
import { Gemini } from "./Model";


/**
 * Adds a user input to the Gemini Flash queue and initiates queue processing.
 * @param {AIChatInput} userInput - The chat input to add to the queue.
 */
export async function callGeminiFlash(userInput: AIChatInput) {
    await Gemini.addToQueue(userInput);
}
