export interface ClientConfig {
    serverUrl?: string;
    apiKey?: string;
    logLevel?: "debug" | "info" | "warn" | "error";
    logToFile?: boolean;
}
