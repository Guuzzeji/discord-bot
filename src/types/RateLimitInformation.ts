export type RateLimitInformation = {
    lastTime: string;
    pauseQueueMinutes: boolean;
    pauseQueueDays: boolean;
    requestCounterMinute: number;
    requestCounterDay: number;
    tokenCounterMinute: number;
}