import pino from "pino";

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
