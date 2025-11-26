import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const link = await sdk.facetime.createFaceTimeLink();
            console.log(`${link}`);
        } catch (error) {
            handleError(error, "Failed to create FaceTime link");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    sdk.on("ft-call-status-changed", (data) => {
        const { uuid, status } = data;
        console.log(`\n${status} (${uuid})`);
    });

    await sdk.connect();
}

main().catch(console.error);
