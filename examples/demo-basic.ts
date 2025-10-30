import { AdvancedIMessageKit } from "../index";
import { createSDK, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("ready");
    });

    sdk.on("new-message", (message: unknown) => {
        const msg = message as {
            handle?: { address?: string };
            text?: string;
        };
        console.log(`\n${msg.handle?.address ?? "unknown"}: ${msg.text ?? "(no text)"}`);
    });

    sdk.on("updated-message", (message: unknown) => {
        const msg = message as {
            dateDelivered?: number;
            dateRead?: number;
        };
        const status = msg.dateRead ? "read" : msg.dateDelivered ? "delivered" : "sent";
        console.log(status);
    });

    sdk.on("error", (error: Error) => {
        console.error("error:", error.message);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
