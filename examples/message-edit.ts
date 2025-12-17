import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const MESSAGE_GUID = process.env.EDIT_MESSAGE_GUID;

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            let messageGuid = MESSAGE_GUID;

            if (!messageGuid) {
                const message = await sdk.messages.sendMessage({
                    chatGuid: CHAT_GUID,
                    message: "text",
                });

                messageGuid = message.guid;
                console.log(`sent: ${messageGuid}`);
                console.log(`original text: ${message.text}`);

                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            const editedMessage = await sdk.messages.editMessage({
                messageGuid: messageGuid,
                editedMessage: "changed text",
                backwardsCompatibilityMessage: "changed text",
                partIndex: 0,
            });

            console.log(`edited: ${editedMessage.guid}`);
            console.log(`new text: ${editedMessage.text}`);
            console.log(`dateEdited: ${editedMessage.dateEdited}`);

            const fetchedMessage = await sdk.messages.getMessage(messageGuid, {
                with: ["attributedBody", "messageSummaryInfo"],
            });
            console.log("\nFetched message after edit:");
            console.log(`  text: ${fetchedMessage.text}`);
            console.log(`  dateEdited: ${fetchedMessage.dateEdited}`);
            console.log(`  messageSummaryInfo: ${JSON.stringify(fetchedMessage.messageSummaryInfo, null, 2)}`);
        } catch (error) {
            handleError(error, "Failed to edit message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
