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

    sdk.on("facetime-status-change", (data: unknown) => {
        const { callUuid, status } = data as { callUuid?: string; status?: string };
        console.log(`\n${status} (${callUuid})`);
    });

    await sdk.connect();
}

main().catch(console.error);
