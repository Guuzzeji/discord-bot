import { LocalStorage } from "node-localstorage";

export class RateLimitFileManger {
    private static readonly FOLDER_PATH = "./rate-limits";

    /**
     * Saves the specified rate limits to local storage.
     * @param name The name of the file to save to.
     * @param value The rate limits value to be stored as a string.
     */
    public static saveRates(name: string, value: string) {
        const storage = new LocalStorage(this.FOLDER_PATH);
        storage.setItem(name, value)
    }

    /**
     * Loads the last saved rate limits from local storage, or returns null if the file does not exist.
     * @param name The name of the file to load from.
     * @returns The rate limits, or null if the file does not exist.
     */
    public static loadRates<T>(name: string): T | null {
        const storage = new LocalStorage(this.FOLDER_PATH);
        return storage.getItem(name) == null ? null : JSON.parse(storage.getItem(name) as string) as T
    }
}
