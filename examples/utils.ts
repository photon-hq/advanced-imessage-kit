import { type ClientConfig, SDK } from "../index";
import type { AdvancedIMessageKit } from "../mobai";

export function createSDK(config: ClientConfig = {}) {
    return SDK({
        serverUrl: config.serverUrl ?? "http://localhost:1234",
        logLevel: config.logLevel ?? "info",
        ...config,
    });
}

export function handleExit(sdk: AdvancedIMessageKit): void {
    const shutdown = async () => {
        console.log("\nShutting down...");
        await sdk.disconnect();
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
