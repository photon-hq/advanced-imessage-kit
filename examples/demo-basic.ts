import { createSDK, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("ready");
    });

    sdk.on("new-message", (message) => {
        console.log(`\n${message.handle?.address ?? "unknown"}: ${message.text ?? "(no text)"}`);
    });

    sdk.on("updated-message", (message) => {
        const status = message.dateRead ? "read" : message.dateDelivered ? "delivered" : "sent";
        console.log(status);
    });

    sdk.on("error", (error) => {
        console.error("error:", error.message);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
