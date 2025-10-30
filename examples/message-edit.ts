import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const message = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "This is the original messge with a typo!",
            });

            console.log(`sent: ${message.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            const edited = await sdk.messages.editMessage({
                messageGuid: message.guid,
                editedMessage: "This is the original message with a typo! (Fixed)",
            });

            console.log(`edited: ${edited.guid}`);
            console.log(`"${edited.text}"`);
        } catch (error) {
            handleError(error, "Failed to edit message");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
