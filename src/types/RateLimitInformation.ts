/**
 * Information about rate limits to be persisted to local storage.
 */
export type RateLimitInformation = {
    /**
     * The last time rate limits were checked.
     */
    lastTime: string;
    /**
     * Whether the queue should be paused due to minute-based rate limits.
     */
    pauseQueueMinutes: boolean;
    /**
     * Whether the queue should be paused due to day-based rate limits.
     */
    pauseQueueDays: boolean;
    /**
     * The number of requests made in the current minute.
     */
    requestCounterMinute: number;
    /**
     * The number of requests made in the current day.
     */
    requestCounterDay: number;
    /**
     * The number of tokens used in the current minute.
     */
    tokenCounterMinute: number;
}

