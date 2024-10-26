export type LLMQueueProcessorOptions = {
    systemPrompt: string,
    maxRequestsPerDay: number,
    maxRequestsPerMinute: number,
    maxTokenPerMinute: number,
    maxSkipsPerRequest: number,
    queueRateLimitCheckSeconds: number,
    requestRateSeconds: number
} 