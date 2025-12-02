import { createSDK, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("Monitoring messages for service type\n");
    });

    sdk.on("new-message", (message) => {
        if (message.isFromMe) return;

        const service = message.chats?.[0]?.guid?.split(";")[0] || "Unknown";

        console.log(`[${service}] ${message.handle?.address || "Unknown"}: ${message.text || "(no text)"}`);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
