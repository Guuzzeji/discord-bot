export function getEnvVar(varName: string): string {
    // TODO: Throw error and exit when env var is not set
    return (process.env[varName] !== undefined) ? process.env[varName] : "";
}