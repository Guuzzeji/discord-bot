import { LocalStorage } from "node-localstorage";

const FOLDER_PATH = "./rate_limits_save";

/**
 * Saves the specified rate limits to local storage.
 * @param name The name of the file to save to.
 * @param value The rate limits value to be stored as a string.
 */
export function saveRateLimitsToStorage(name: string, value: string) {
    const storage = new LocalStorage(FOLDER_PATH);
    storage.setItem(name, value)
}

/**
 * Loads the last saved rate limits from local storage, or returns null if the file does not exist.
 * @param name The name of the file to load from.
 * @returns The rate limits, or null if the file does not exist.
 */
export function loadLastRateLimitsFromStorage<T>(name: string): T | null {
    const storage = new LocalStorage(FOLDER_PATH);
    return storage.getItem(name) == null ? null : JSON.parse(storage.getItem(name) as string) as T
}