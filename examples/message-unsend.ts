import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const MESSAGE_GUID = process.env.UNSEND_MESSAGE_GUID;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            let messageGuid = MESSAGE_GUID;

            if (!messageGuid) {
                const message = await sdk.messages.sendMessage({
                    chatGuid: CHAT_GUID,
                    message: "This message will be unsent in 3 seconds!",
                });

                messageGuid = message.guid;
                console.log(`sent: ${messageGuid}`);

                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            const unsentMessage = await sdk.messages.unsendMessage({
                messageGuid: messageGuid,
            });

            console.log(`unsent: ${unsentMessage.guid}`);
        } catch (error) {
            handleError(error, "Failed to unsend message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
