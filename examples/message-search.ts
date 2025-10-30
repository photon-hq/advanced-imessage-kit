import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const messages = await sdk.messages.getMessages({
                chatGuid: CHAT_GUID,
                limit: 20,
            });

            console.log(`${messages.length} messages\n`);

            messages.slice(0, 5).forEach((msg, i) => {
                const sender = msg.isFromMe ? "me" : msg.handle?.address || "unknown";
                console.log(`${i + 1}. ${msg.text || "(attachment)"}`);
                console.log(`   ${sender}`);
                console.log(`   ${new Date(msg.dateCreated).toLocaleString()}\n`);
            });
        } catch (error) {
            handleError(error, "Failed to search messages");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
