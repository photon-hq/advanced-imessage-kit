import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const stats = await sdk.server.getMessageStats();
            console.log("Statistics:");
            console.log(JSON.stringify(stats, null, 2));
        } catch (error) {
            handleError(error, "Failed to get statistics");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
