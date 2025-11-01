import { SDK } from "../index";

const UUID = "ab27b487-526b-4ce5-b920-938de84521f8";

async function main() {
    const sdk = SDK({
        serverUrl: `wss://imsgd.photon.codes/ws/${UUID}`,
        connectionMode: "websocket",
        logLevel: "debug",
    });

    sdk.on("ready", () => {
        console.log("Connected, waiting for messages...");
    });

    sdk.on("new-message", (message: any) => {
        const sender = message.isFromMe ? "me" : message.handle?.address || "unknown";
        console.log(`New message from ${sender}: ${message.text || "(attachment)"}`);
    });

    sdk.on("error", (error: any) => {
        console.error("Error:", error.message || error);
    });

    await sdk.connect();

    process.on("SIGINT", async () => {
        await sdk.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);

