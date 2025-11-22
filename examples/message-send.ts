import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    try {
        await sdk.connect();

        const result = await sdk.send(CHAT_GUID, "Hello from MOBAI!");

        console.log(`sent at: ${result.sentAt.toLocaleString()}`);
        if (result.message) {
            console.log(`guid: ${result.message.guid}`);
        }
    } catch (error) {
        handleError(error, "Failed to send message");
    } finally {
        await sdk.close();
        process.exit(0);
    }
}

main().catch(console.error);
