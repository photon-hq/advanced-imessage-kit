import { createSDK, handleError } from "./utils";

const ADDRESS = process.env.ADDRESS || "+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Get handle count
            const totalCount = await sdk.handles.getHandleCount();
            console.log(`Total handles: ${totalCount}\n`);

            // Check service availability
            console.log(`Service availability for ${ADDRESS}:\n`);
            const hasIMessage = await sdk.handles.getHandleAvailability(ADDRESS, "imessage");
            const hasFaceTime = await sdk.handles.getHandleAvailability(ADDRESS, "facetime");

            console.log(`iMessage: ${hasIMessage ? "available" : "not available"}`);
            console.log(`FaceTime: ${hasFaceTime ? "available" : "not available"}`);

            const recommendedGuid = hasIMessage ? `iMessage;-;${ADDRESS}` : `SMS;-;${ADDRESS}`;
            console.log(`\nRecommended chatGuid: ${recommendedGuid}`);
        } catch (error) {
            handleError(error, "Failed to query handles");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
