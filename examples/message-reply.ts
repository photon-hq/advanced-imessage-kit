import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Send first message
            const firstMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "What's your favorite color?",
            });
            console.log(`sent: ${firstMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Send second message
            const secondMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Also, what's your favorite food?",
            });
            console.log(`sent: ${secondMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Reply to the FIRST message
            const replyMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "My favorite color is blue!",
                selectedMessageGuid: firstMessage.guid,
            });

            console.log(`\nreplied: ${replyMessage.guid}`);
            console.log(`replying to: ${firstMessage.guid.substring(0, 20)}...`);
        } catch (error) {
            handleError(error, "Failed to send reply");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
