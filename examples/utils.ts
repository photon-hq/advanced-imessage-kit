import { IMessageSDK, type IMessageConfig } from "../index";

type LocalConfig = Omit<IMessageConfig, "serverUrl"> & { serverUrl?: string };

export function createSDK(config: LocalConfig = {}): IMessageSDK {
    const { serverUrl = "http://localhost:1234", ...rest } = config;

    return new IMessageSDK({
        serverUrl,
        ...rest,
    });
}

export function handleExit(sdk: IMessageSDK): void {
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
