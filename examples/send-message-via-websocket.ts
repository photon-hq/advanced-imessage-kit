import { SDK } from "../index";

const UUID = "ab27b487-526b-4ce5-b920-938de84521f8";

async function main() {
    const sdk = SDK({
        serverUrl: `wss://imsgd.photon.codes/ws/${UUID}`,
        connectionMode: "websocket",
        logLevel: "info",
    });

    sdk.on("ready", async () => {
        console.log("Connected! Sending messages...");

        try {
            // Get chats first
            const adapter = sdk.socket as any;
            const chats = await adapter.request("get-chats", { withParticipants: true });
            console.log(`Found ${chats.data.length} chats`);

            if (chats.data.length === 0) {
                console.log("No chats found");
                return;
            }

            // Send message to first chat
            const firstChat = chats.data[0];
            console.log(`Sending message to: ${firstChat.displayName || firstChat.guid}`);

            const response = await adapter.request("send-message", {
                chatGuid: firstChat.guid,
                message: "Hello from WebSocket!",
            });

            console.log("Message sent successfully:", response.data.guid);
        } catch (error: any) {
            console.error("Error:", error.message);
        }

        await sdk.disconnect();
        process.exit(0);
    });

    sdk.on("error", (error: any) => {
        console.error("SDK Error:", error.message || error);
    });

    await sdk.connect();

    process.on("SIGINT", async () => {
        await sdk.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);

