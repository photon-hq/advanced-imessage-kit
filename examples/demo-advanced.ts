/**
 * Example: Advanced Demo
 * Demonstrates multiple advanced features and event listening
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "debug",
    });

    await sdk.connect();

    try {
        // Fetch chats
        const chatList = await sdk.listChats();
        console.log(`${chatList.length} chats:`);
        chatList.slice(0, 10).forEach((chat, i) => {
            console.log(`  ${i + 1}. ${chat.displayName || chat.chatIdentifier}`);
        });

        if (chatList.length > 0) {
            const chat = chatList[0];
            if (chat) {
                console.log(
                    `\nFirst chat: ${chat.displayName || chat.chatIdentifier} (${chat.participants?.length || 0} participants)`,
                );
            }
        }

        // Get server info
        const serverInfo = await sdk.getServerInfo();
        console.log(`\nServer info: ${JSON.stringify(serverInfo, null, 2)}`);

        // Start watching for messages
        await sdk.startWatching({
            onNewMessage: (message) => {
                console.log(`\nNew message: ${JSON.stringify(message, null, 2)}`);
            },
        });

        console.log("\nWatching for messages...");
    } catch (error) {
        console.error("Setup failed:", error);
    }

    // Handle exit
    process.on("SIGINT", async () => {
        console.log("\nShutting down...");
        await sdk.close();
        process.exit(0);
    });
}

main().catch(console.error);
