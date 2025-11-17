/**
 * 示例 6: 列出聊天和消息
 *
 * 演示如何使用简洁 API 获取聊天列表和消息
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        // Get all chats
        console.log("Getting chat list...\n");
        const chats = await sdk.listChats();

        console.log(`Found ${chats.length} chats:\n`);

        // Display first 10 chats
        for (const chat of chats.slice(0, 10)) {
            const name = chat.displayName || "Unnamed chat";
            console.log(`${name}`);
            console.log(`   GUID: ${chat.guid}`);
            console.log();
        }

        // Get unread message count
        const unreadCount = await sdk.getUnreadCount();
        console.log(`\nTotal unread messages: ${unreadCount}`);

        // Get messages from first chat
        if (chats.length > 0) {
            const firstChat = chats[0]!;
            console.log(`\nGetting recent messages from ${firstChat.displayName || "chat"}...\n`);

            const messages = await sdk.getMessages(firstChat.guid, {
                limit: 5,
                sort: "DESC",
            });

            for (const msg of messages) {
                const sender = msg.isFromMe ? "me" : msg.handle?.address || "Unknown";
                const text = msg.text || "(no text)";
                const time = new Date(msg.dateCreated).toLocaleString();

                console.log(`${sender}: ${text}`);
                console.log(`   ${time}\n`);
            }
        }

        console.log("Done");
    } catch (error) {
        console.error("Failed to get data:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
