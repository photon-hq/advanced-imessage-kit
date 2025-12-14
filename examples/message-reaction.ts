import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const MESSAGE_GUID = process.env.MESSAGE_GUID;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            let messageGuid = MESSAGE_GUID;

            if (!messageGuid) {
                const testMessage = await sdk.messages.sendMessage({
                    chatGuid: CHAT_GUID,
                    message: "Test message for reactions!",
                });

                messageGuid = testMessage.guid;
                console.log(`sent: ${messageGuid}`);
            }

            // ❤️ = love
            await sdk.messages.sendReaction({
                chatGuid: CHAT_GUID,
                messageGuid,
                reaction: "love",
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 😂 = laugh
            await sdk.messages.sendReaction({
                chatGuid: CHAT_GUID,
                messageGuid,
                reaction: "laugh",
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 👎 = dislike
            await sdk.messages.sendReaction({
                chatGuid: CHAT_GUID,
                messageGuid,
                reaction: "dislike",
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 👍 = like
            await sdk.messages.sendReaction({
                chatGuid: CHAT_GUID,
                messageGuid,
                reaction: "like",
            });
        } catch (error) {
            handleError(error, "Failed to send reaction");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
