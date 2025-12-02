import { createSDK, handleError } from "./utils";

const CONTACTS_TO_CHECK = [process.env.PHONE_NUMBER || "+13322593375"];

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        for (const contact of CONTACTS_TO_CHECK) {
            try {
                const hasIMessage = await sdk.handles.getHandleAvailability(contact, "imessage");
                const hasFaceTime = await sdk.handles.getHandleAvailability(contact, "facetime");

                const chatGuid = hasIMessage ? `iMessage;-;${contact}` : `SMS;-;${contact}`;

                console.log(`Checking: ${contact}`);
                console.log(`iMessage: ${hasIMessage ? "yes" : "no"}`);
                console.log(`FaceTime: ${hasFaceTime ? "yes" : "no"}`);
                console.log(`CHAT_GUID: ${chatGuid}`);
                console.log(`Service: ${hasIMessage ? "iMessage" : "SMS"}\n`);
            } catch (error) {
                handleError(error, `Failed to check availability for ${contact}`);
            }
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
