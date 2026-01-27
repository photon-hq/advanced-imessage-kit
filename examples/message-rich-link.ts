import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const message = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "https://photon.codes/",
                richLink: true,
            });

            console.log(`sent rich link: ${message.guid}`);
            console.log(`balloonBundleId: ${message.balloonBundleId}`);
            console.log(`${new Date(message.dateCreated).toLocaleString()}`);
        } catch (error) {
            handleError(error, "Failed to send rich link message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
