import { createSDK, handleError, handleExit } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            console.log(`starting typing for ${CHAT_GUID}`);
            await sdk.startTyping(CHAT_GUID);

            await new Promise((resolve) => setTimeout(resolve, 3000));

            await sdk.send(CHAT_GUID, "Hello! I was typing for a moment 😊");

            await new Promise((resolve) => setTimeout(resolve, 2000));

            await sdk.startTyping(CHAT_GUID);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            await sdk.stopTyping(CHAT_GUID);
        } catch (error) {
            handleError(error, "Typing indicator demo failed");
        }

        await sdk.close();
        process.exit(0);
    });

    sdk.on("typing-indicator", (data) => {
        const typingData = data as { display?: boolean; guid?: string };
        const status = typingData.display ? "typing" : "stopped";
        console.log(`${status} in ${typingData.guid}`);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
