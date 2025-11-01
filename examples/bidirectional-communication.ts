import { SDK } from "../index";
import { WebSocketAdapter } from "../lib/WebSocketAdapter";

const UUID = "ab27b487-526b-4ce5-b920-938de84521f8";

async function main() {
    const sdk = SDK({
        serverUrl: `wss://imsgd.photon.codes/ws/${UUID}`,
        connectionMode: "websocket",
        logLevel: "info",
    });

    // Receive messages from Server
    sdk.on("ready", () => {
        console.log("Connected! Ready to receive and send messages.");
    });

    sdk.on("new-message", (message: any) => {
        const sender = message.isFromMe ? "me" : message.handle?.address || "unknown";
        console.log(`\n[Received] New message from ${sender}: ${message.text || "(attachment)"}`);
    });

    sdk.on("typing-indicator", (data: any) => {
        console.log(`[Typing] ${data.display ? "Started" : "Stopped"} typing in ${data.guid}`);
    });

    sdk.on("error", (error: any) => {
        console.error("[Error]", error.message || error);
    });

    await sdk.connect();

    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Drive Server to send messages
    const adapter = sdk.socket as WebSocketAdapter;

    try {
        // Get chats
        console.log("\n[Command] Getting chats...");
        const chatsResult = await adapter.request("get-chats", { withParticipants: true });
        console.log(`[Response] Found ${chatsResult.data.length} chats`);

        if (chatsResult.data.length === 0) {
            console.log("[Info] No chats found. Exiting.");
            await sdk.disconnect();
            process.exit(0);
        }

        // Send message to first chat
        const firstChat = chatsResult.data[0];
        console.log(`\n[Command] Sending message to: ${firstChat.displayName || firstChat.guid}`);
        
        const sendResult = await adapter.request("send-message", {
            chatGuid: firstChat.guid,
            message: "Hello! This message was sent via WebSocket command.",
        });

        console.log(`[Response] Message sent successfully! GUID: ${sendResult.data.guid}`);
        console.log(`[Response] Message text: ${sendResult.data.text}`);

        // Get recent messages
        console.log(`\n[Command] Getting recent messages from chat...`);
        const messagesResult = await adapter.request("get-messages", {
            chatGuid: firstChat.guid,
            limit: 5,
        });
        console.log(`[Response] Found ${messagesResult.data.length} messages`);

    } catch (error: any) {
        console.error("[Error] Command failed:", error.message);
    }

    // Keep running to receive messages
    console.log("\n[Info] Waiting for incoming messages... (Press Ctrl+C to exit)");
    
    process.on("SIGINT", async () => {
        console.log("\n[Info] Disconnecting...");
        await sdk.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);

