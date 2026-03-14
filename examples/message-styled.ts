import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("=== Text Styles & Animations (requires Private API) ===\n");

        try {
            const boldMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "This is bold text",
                textStyles: [{ start: 8, end: 12, bold: true }],
            });
            console.log(`bold: ${boldMsg.guid}`);
            await sleep(2000);

            const italicMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "This is italic text",
                textStyles: [{ start: 8, end: 14, italic: true }],
            });
            console.log(`italic: ${italicMsg.guid}`);
            await sleep(2000);

            const underlineMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "This is underlined",
                textStyles: [{ start: 8, end: 18, underline: true }],
            });
            console.log(`underline: ${underlineMsg.guid}`);
            await sleep(2000);

            const strikeMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "This is struck through",
                textStyles: [{ start: 8, end: 22, strikethrough: true }],
            });
            console.log(`strikethrough: ${strikeMsg.guid}`);
            await sleep(2000);

            const multiStyleMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Bold here, italic there, underline everywhere",
                textStyles: [
                    { start: 0, end: 9, bold: true },
                    { start: 11, end: 23, italic: true },
                    { start: 25, end: 45, underline: true },
                ],
            });
            console.log(`multi-range: ${multiStyleMsg.guid}`);
            await sleep(2000);

            const rippleMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Ripple wave!",
                textAnimation: "ripple",
            });
            console.log(`ripple: ${rippleMsg.guid}`);
            await sleep(2000);

            const explodeMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Boom! Explode!",
                textAnimation: "explode",
            });
            console.log(`explode: ${explodeMsg.guid}`);
            await sleep(2000);

            const bloomMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Bloom!",
                textAnimation: "bloom",
            });
            console.log(`bloom: ${bloomMsg.guid}`);
            await sleep(2000);

            const styledAnimMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Bold text with jitter!",
                textStyles: [{ start: 0, end: 9, bold: true }],
                textAnimation: "jitter",
            });
            console.log(`bold + jitter: ${styledAnimMsg.guid}`);
            await sleep(2000);

            const confettiMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Confetti!",
                bubbleEffect: "confetti",
            });
            console.log(`confetti: ${confettiMsg.guid}`);
            await sleep(2000);

            const slamMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "BAM!",
                bubbleEffect: "slam",
            });
            console.log(`slam: ${slamMsg.guid}`);
            await sleep(2000);

            const allMsg = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Bold shaking fireworks!",
                textStyles: [{ start: 0, end: 4, bold: true }],
                textAnimation: "shake",
                bubbleEffect: "fireworks",
            });
            console.log(`all layers: ${allMsg.guid}`);

            console.log("\n--- Three independent layers ---");
            console.log("  textStyles:     per-range formatting (bold / italic / underline / strikethrough)");
            console.log("  textAnimation:  whole-message character animation (big / shake / ripple / bloom / …)");
            console.log("  bubbleEffect:   bubble / screen effect (confetti / lasers / slam / …)");
        } catch (error) {
            handleError(error, "Failed to send styled message");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
