import type { ChatSummary } from "../index";
import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const chats: ChatSummary[] = await sdk.listChats();
            console.log(`${chats.length} chats\n`);

            chats.slice(0, 10).forEach((chat, i) => {
                const type = chat.isGroup ? "group" : "individual";
                const participants = chat.rawChat.participants?.length || 0;
                console.log(`${i + 1}. ${chat.displayName || chat.chatGuid} (${type})`);
                console.log(`   ${chat.chatGuid}`);
                console.log(`   ${participants} people\n`);
            });
        } catch (error) {
            handleError(error, "Failed to fetch chats");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
