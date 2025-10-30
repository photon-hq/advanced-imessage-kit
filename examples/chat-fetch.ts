import type { Chat } from "../index";
import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const chats: Chat[] = await sdk.chats.getChats();
            console.log(`${chats.length} chats\n`);

            chats.slice(0, 10).forEach((chat, i) => {
                const type = "style" in chat && chat.style === 43 ? "group" : "individual";
                console.log(`${i + 1}. ${chat.displayName || chat.chatIdentifier} (${type})`);
                console.log(`   ${chat.guid}`);
                console.log(`   ${chat.participants?.length || 0} people\n`);
            });
        } catch (error) {
            handleError(error, "Failed to fetch chats");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
