import type { FindMyLocationItem } from "../types/findmy";
import { createSDK, handleExit } from "./utils";

const REFRESH_INTERVAL_MS = 30_000;

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
}

function formatLocation(loc: FindMyLocationItem, indent = "  "): string {
    const parts = [
        `${indent}Coordinates: ${loc.coordinates[0]}, ${loc.coordinates[1]}`,
        `${indent}Maps:        https://maps.google.com/?q=${loc.coordinates[0]},${loc.coordinates[1]}`,
    ];
    if (loc.long_address) parts.push(`${indent}Address:     ${loc.long_address}`);
    if (loc.short_address) parts.push(`${indent}Short:       ${loc.short_address}`);
    parts.push(`${indent}Status:      ${loc.status}`);
    parts.push(`${indent}Updated:     ${formatTime(loc.last_updated)}`);
    if (loc.expiry) {
        const remaining = Math.floor((loc.expiry - Date.now()) / 60000);
        parts.push(`${indent}Expires in:  ${remaining} minutes`);
    }
    return parts.join("\n");
}

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("\n--- Initial ---");
        try {
            const locations = await sdk.icloud.refreshFindMyFriends();
            if (locations.length === 0) {
                console.log("  No friends sharing location.");
            }
            for (const loc of locations) {
                console.log(`\n  ${loc.handle}`);
                console.log(formatLocation(loc));
            }
        } catch (err) {
            console.error("Failed to fetch initial locations:", err);
        }

        console.log(`\n--- Watching ---\n`);

        setInterval(() => {
            sdk.icloud.refreshFindMyFriends().catch(() => {});
        }, REFRESH_INTERVAL_MS);
    });

    sdk.on("new-findmy-location", (location: FindMyLocationItem) => {
        console.log(`[${formatTime(Date.now())}] ${location.handle} updated:`);
        console.log(formatLocation(location));
        console.log();
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
