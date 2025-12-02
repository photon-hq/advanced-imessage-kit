import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Get server info
            console.log("Server Information\n");
            const info = await sdk.server.getServerInfo();
            console.log(`OS Version: ${info.os_version}`);
            console.log(`Server Version: ${info.server_version}`);
            console.log(`Private API: ${info.private_api ? "enabled" : "disabled"}`);
            console.log(`Helper Connected: ${info.helper_connected ? "yes" : "no"}`);
            if (info.detected_icloud) {
                console.log(`iCloud: ${info.detected_icloud}`);
            }
            if (info.detected_imessage) {
                console.log(`iMessage: ${info.detected_imessage}`);
            }

            // Get message statistics
            console.log("\nMessage Statistics\n");
            const stats = await sdk.server.getMessageStats();
            console.log(`Total: ${stats.total?.toLocaleString() || "N/A"}`);
            console.log(`Sent: ${stats.sent?.toLocaleString() || "N/A"}`);
            console.log(`Received: ${stats.received?.toLocaleString() || "N/A"}`);

            // Get media statistics
            console.log("\nMedia Statistics\n");
            try {
                const mediaStats = await sdk.server.getMediaStatistics();
                console.log(JSON.stringify(mediaStats, null, 2));
            } catch {
                console.log("Media statistics not available");
            }

            // Get server logs
            console.log("\nRecent Logs (last 10)\n");
            try {
                const logs = await sdk.server.getServerLogs(10);
                if (Array.isArray(logs) && logs.length > 0) {
                    logs.forEach((log, i) => {
                        console.log(`${i + 1}. ${log}`);
                    });
                } else {
                    console.log("No logs available");
                }
            } catch {
                console.log("Logs not available");
            }
        } catch (error) {
            handleError(error, "Failed to get server info");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
