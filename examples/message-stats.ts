import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const stats = await sdk.server.getMessageStats();

            console.log(`${stats.total.toLocaleString()} total`);
            console.log(`${stats.sent.toLocaleString()} sent / ${stats.received.toLocaleString()} received`);
            console.log(`${((stats.sent / stats.received) * 100).toFixed(1)}% ratio\n`);

            console.log(`24h: ${stats.last24h.toLocaleString()}`);
            console.log(`7d: ${stats.last7d.toLocaleString()}`);
            console.log(`30d: ${stats.last30d.toLocaleString()}`);
            console.log(`avg: ${(stats.last30d / 30).toFixed(1)}/day`);
        } catch (error) {
            handleError(error, "Failed to get statistics");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
