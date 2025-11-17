/**
 * Example: List Chats
 * Demonstrates how to fetch and display all chats
 */

import { AdvancedIMessageKit, type Chat } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        const chats: Chat[] = await sdk.listChats();
        console.log(`Found ${chats.length} chats\n`);

        chats.slice(0, 10).forEach((chat, i) => {
            const type = "style" in chat && chat.style === 43 ? "group" : "individual";
            console.log(`${i + 1}. ${chat.displayName || chat.chatIdentifier} (${type})`);
            console.log(`   GUID: ${chat.guid}`);
            console.log(`   Participants: ${chat.participants?.length || 0}\n`);
        });
    } catch (error) {
        console.error("Failed to fetch chats:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
