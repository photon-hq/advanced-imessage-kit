import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Get a single chat by guid
            const chat = await sdk.chats.getChat(CHAT_GUID);

            console.log("Chat details:");
            console.log(`  guid: ${chat.guid}`);
            console.log(`  displayName: ${chat.displayName || "(none)"}`);
            console.log(`  chatIdentifier: ${chat.chatIdentifier}`);
            console.log(`  participants: ${chat.participants?.length || 0}`);

            if (chat.participants?.length) {
                console.log("\nParticipants:");
                chat.participants.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.address}`);
                });
            }

            // Get chat with additional data (e.g., lastMessage)
            console.log("\n--- With lastMessage ---\n");

            const chatWithLastMessage = await sdk.chats.getChat(CHAT_GUID, {
                with: ["lastMessage"],
            });

            if (chatWithLastMessage.lastMessage) {
                console.log("Last message:");
                console.log(`  text: ${chatWithLastMessage.lastMessage.text}`);
                console.log(`  from: ${chatWithLastMessage.lastMessage.isFromMe ? "me" : "them"}`);
                console.log(`  date: ${new Date(chatWithLastMessage.lastMessage.dateCreated).toLocaleString()}`);
            }
        } catch (error) {
            handleError(error, "Failed to get chat");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
