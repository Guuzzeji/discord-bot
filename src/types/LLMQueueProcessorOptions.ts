/**
 * Options for initializing a new LLMQueueProcessor instance.
 */
export type LLMQueueProcessorOptions = {
    /**
     * The system prompt to use for the AI model.
     */
    systemPrompt: string,
    /**
     * The maximum number of requests to allow in a day.
     */
    maxRequestsPerDay: number,
    /**
     * The maximum number of requests to allow in a minute.
     */
    maxRequestsPerMinute: number,
    /**
     * The maximum number of tokens to allow in a minute.
     */
    maxTokenPerMinute: number,
    /**
     * The maximum number of skips to allow before cancelling a request.
     */
    maxSkipsPerRequest: number,
    /**
     * The interval in seconds to check the queue for rate limits.
     */
    queueRateLimitCheckSeconds: number,
    /**
     * The interval in seconds between requests to the AI model.
     */
    requestRateSeconds: number
}

