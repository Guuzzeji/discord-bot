import 'dotenv/config';
import pino from "pino";

/**
 * Logger for logging messages to the console. (use this over console.log please)
 */
export const logger = pino({});

/**
 * Retrieves the value of an environment variable.
 * 
 * @param varName - The name of the environment variable to retrieve.
 * @returns The value of the environment variable, or an empty string if it is not defined.
 */
export function getEnvVar(varName: string): string {
    return (process.env[varName] !== undefined) ? process.env[varName] : "";
}

/**
 * Calculates the absolute difference in days between two dates.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The absolute difference in days between the two dates
 */
export function dateDifferenceByDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Calculates the absolute difference in minutes between two dates.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The absolute difference in minutes between the two dates
 */
export function dateDifferenceByMinutes(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return diffTime / (1000 * 60);
}