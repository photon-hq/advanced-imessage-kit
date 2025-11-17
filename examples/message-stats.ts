/**
 * Example: Message Statistics
 * Demonstrates how to retrieve message statistics (requires private API)
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        const stats = await sdk.getMessageStats();

        console.log(`${stats.total.toLocaleString()} total messages`);
        console.log(`${stats.sent.toLocaleString()} sent / ${stats.received.toLocaleString()} received`);
        console.log(`${((stats.sent / stats.received) * 100).toFixed(1)}% ratio\n`);

        console.log(`Last 24h: ${stats.last24h.toLocaleString()}`);
        console.log(`Last 7d: ${stats.last7d.toLocaleString()}`);
        console.log(`Last 30d: ${stats.last30d.toLocaleString()}`);
        console.log(`Average: ${(stats.last30d / 30).toFixed(1)}/day`);
    } catch (error) {
        console.error("Failed to get statistics:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
