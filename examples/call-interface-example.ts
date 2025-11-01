import { SDK } from "../index";
import { WebSocketAdapter } from "../lib/WebSocketAdapter";

const UUID = "ab27b487-526b-4ce5-b920-938de84521f8";

async function main() {
    const sdk = SDK({
        serverUrl: `wss://imsgd.photon.codes/ws/${UUID}`,
        connectionMode: "websocket",
        logLevel: "info",
    });

    sdk.on("ready", async () => {
        console.log("Connected! Testing call-interface...");

        const adapter = sdk.socket as WebSocketAdapter;

        try {
            // Example 1: Call MessageInterface.sendAttachmentSync
            console.log("\n[Example 1] Sending attachment via MessageInterface...");
            const attachmentResult = await adapter.request("call-interface", {
                interface: "MessageInterface",
                method: "sendAttachmentSync",
                args: {
                    chatGuid: "your-chat-guid",
                    attachmentPath: "/path/to/file.jpg",
                    attachmentName: "file.jpg",
                },
            });
            console.log("Attachment sent:", attachmentResult.data?.guid);

            // Example 2: Call MessageInterface.reactToMessage
            console.log("\n[Example 2] Reacting to message...");
            const reactionResult = await adapter.request("call-interface", {
                interface: "MessageInterface",
                method: "reactToMessage",
                args: {
                    chatGuid: "your-chat-guid",
                    messageGuid: "your-message-guid",
                    reaction: "love",
                },
            });
            console.log("Reaction sent:", reactionResult.success);

            // Example 3: Call MessageInterface.editMessage
            console.log("\n[Example 3] Editing message...");
            const editResult = await adapter.request("call-interface", {
                interface: "MessageInterface",
                method: "editMessage",
                args: {
                    chatGuid: "your-chat-guid",
                    messageGuid: "your-message-guid",
                    editedText: "Edited message text",
                    partIndex: 0,
                },
            });
            console.log("Message edited:", editResult.data?.guid);

            // Example 4: Call FaceTimeInterface.create
            console.log("\n[Example 4] Creating FaceTime link...");
            const facetimeResult = await adapter.request("call-interface", {
                interface: "FaceTimeInterface",
                method: "create",
                args: [],
            });
            console.log("FaceTime link:", facetimeResult.data);

            // Example 5: Call ChatInterface.createChat
            console.log("\n[Example 5] Creating chat...");
            const chatResult = await adapter.request("call-interface", {
                interface: "ChatInterface",
                method: "createChat",
                args: {
                    addresses: ["+1234567890"],
                },
            });
            console.log("Chat created:", chatResult.data?.guid);

            // Example 6: Call FindMyInterface.getFriends
            console.log("\n[Example 6] Getting FindMy friends...");
            const findmyResult = await adapter.request("call-interface", {
                interface: "FindMyInterface",
                method: "getFriends",
                args: [],
            });
            console.log("FindMy friends:", findmyResult.data?.length || 0);

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

