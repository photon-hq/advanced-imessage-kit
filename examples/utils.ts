import type { AdvancedIMessageKit } from "../client";
import { type ClientConfig, SDK } from "../index";

export function createSDK(config: ClientConfig = {}) {
    return SDK({
        serverUrl: config.serverUrl ?? process.env.SERVER_URL ?? "http://localhost:1234",
        apiKey: config.apiKey ?? process.env.API_KEY,
        logLevel: config.logLevel ?? "info",
        ...config,
    });
}

export function handleExit(sdk: AdvancedIMessageKit): void {
    const shutdown = async () => {
        console.log("\nShutting down...");
        await sdk.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

export function handleError(error: unknown, context: string) {
    const message = error instanceof Error ? error.message : String(error);
    if (context) {
        console.error(`${context}:`, message);
    } else {
        console.error("Error:", message);
    }
}
