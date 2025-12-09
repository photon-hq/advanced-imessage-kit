import { isPollMessage, isPollVote, parsePollDefinition, parsePollVotes } from "../lib/poll-utils";
import type { MessageResponse } from "../types";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

const REACTION_MAP: Record<string, { emoji: string; name: string; action: "added" | "removed" }> = {
    "2000": { emoji: "❤️", name: "Love", action: "added" },
    "2001": { emoji: "👍", name: "Like", action: "added" },
    "2002": { emoji: "👎", name: "Dislike", action: "added" },
    "2003": { emoji: "😂", name: "Laugh", action: "added" },
    "2004": { emoji: "‼️", name: "Emphasize", action: "added" },
    "2005": { emoji: "❓", name: "Question", action: "added" },
    "3000": { emoji: "❤️", name: "Love", action: "removed" },
    "3001": { emoji: "👍", name: "Like", action: "removed" },
    "3002": { emoji: "👎", name: "Dislike", action: "removed" },
    "3003": { emoji: "😂", name: "Laugh", action: "removed" },
    "3004": { emoji: "‼️", name: "Emphasize", action: "removed" },
    "3005": { emoji: "❓", name: "Question", action: "removed" },
};

type MessageType = "message" | "reaction" | "poll" | "poll-vote" | "sticker" | "other";

function getMessageType(msg: MessageResponse): MessageType {
    const assocType = msg.associatedMessageType;

    if (isPollMessage(msg)) {
        return isPollVote(msg) ? "poll-vote" : "poll";
    }

    if (assocType && assocType !== "0") {
        const typeNum = Number.parseInt(assocType, 10);
        if (typeNum === 1000) return "sticker";
        if (typeNum >= 2000 && typeNum <= 3005) return "reaction";
        return "other";
    }

    return "message";
}

function formatReaction(msg: MessageResponse, index: number): string {
    const sender = msg.isFromMe ? "Me" : msg.handle?.address || "Unknown";
    const date = new Date(msg.dateCreated).toLocaleString();
    const reaction = REACTION_MAP[msg.associatedMessageType || ""];

    if (reaction) {
        const actionText = reaction.action === "added" ? "reacted with" : "removed";
        return `${index}. ${reaction.emoji} ${reaction.name}
   Action: ${sender} ${actionText} ${reaction.emoji}
   Target: ${msg.associatedMessageGuid || "unknown"}
   Date:   ${date}`;
    }

    return `${index}. Unknown Reaction (type: ${msg.associatedMessageType})
   From: ${sender}
   Date: ${date}`;
}

function formatPoll(msg: MessageResponse, index: number): string {
    const sender = msg.isFromMe ? "Me" : msg.handle?.address || "Unknown";
    const date = new Date(msg.dateCreated).toLocaleString();
    const pollData = parsePollDefinition(msg);

    if (pollData) {
        const title = pollData.title || "(Untitled Poll)";
        const options = pollData.options.map((opt, i) => `      ${i + 1}. ${opt.text}`).join("\n");
        return `${index}. 📊 Poll: "${title}"
   Creator: ${pollData.creatorHandle || sender}
   Options:
${options}
   Date: ${date}`;
    }

    return `${index}. 📊 Poll (unable to parse details)
   From: ${sender}
   Date: ${date}`;
}

function formatPollVote(msg: MessageResponse, index: number): string {
    const sender = msg.isFromMe ? "Me" : msg.handle?.address || "Unknown";
    const date = new Date(msg.dateCreated).toLocaleString();
    const voteData = parsePollVotes(msg);

    if (voteData && voteData.votes.length > 0) {
        const votes = voteData.votes
            .map((v) => {
                const voter = v.participantHandle || "Someone";
                return `      • ${voter} voted for option "${v.voteOptionIdentifier}"`;
            })
            .join("\n");
        return `${index}. 🗳️ Poll Vote
   Voter: ${sender}
   Votes:
${votes}
   Poll:  ${msg.associatedMessageGuid || "unknown"}
   Date:  ${date}`;
    }

    return `${index}. 🗳️ Poll Vote
   Voter: ${sender}
   Poll:  ${msg.associatedMessageGuid || "unknown"}
   Date:  ${date}`;
}

function formatMessage(msg: MessageResponse, index: number): string {
    const sender = msg.isFromMe ? "Me" : msg.handle?.address || "Unknown";
    const date = new Date(msg.dateCreated).toLocaleString();
    const type = getMessageType(msg);

    switch (type) {
        case "reaction":
            return formatReaction(msg, index);
        case "poll":
            return formatPoll(msg, index);
        case "poll-vote":
            return formatPollVote(msg, index);
        case "sticker":
            return `${index}. 🎨 Sticker
   From: ${sender}
   Target: ${msg.associatedMessageGuid || "unknown"}
   Date: ${date}`;
        case "message":
        default: {
            const text = msg.text || "";
            const attachmentCount = msg.attachments?.length || 0;
            let content: string;
            if (text) {
                content = text.length > 60 ? `${text.slice(0, 60)}...` : text;
            } else if (attachmentCount > 0) {
                const types = msg.attachments?.map((a) => a.mimeType?.split("/")[0] || "file").join(", ");
                content = `(${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""}: ${types})`;
            } else {
                content = "(empty)";
            }
            return `${index}. 💬 "${content}"
   From: ${sender}
   Date: ${date}`;
        }
    }
}

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            console.log("=== Message History Example ===\n");
            console.log("This example shows messages, reactions, and polls.\n");

            const options = CHAT_GUID
                ? { chatGuid: CHAT_GUID, limit: 30, sort: "DESC" as const }
                : { limit: 30, sort: "DESC" as const };

            const messages = CHAT_GUID
                ? await sdk.chats.getChatMessages(CHAT_GUID, { ...options, with: ["message.payloadData"] })
                : await sdk.messages.getMessages({ ...options, with: ["message.payloadData"] });

            if (messages.length === 0) {
                console.log("No messages found.");
                await sdk.close();
                process.exit(0);
                return;
            }

            const stats = { message: 0, reaction: 0, poll: 0, "poll-vote": 0, sticker: 0, other: 0 };
            for (const msg of messages) {
                stats[getMessageType(msg)]++;
            }

            console.log("📈 Message Type Statistics:");
            console.log(`   💬 Messages:  ${stats.message}`);
            console.log(`   ❤️ Reactions: ${stats.reaction}`);
            console.log(`   📊 Polls:     ${stats.poll}`);
            console.log(`   🗳️ Votes:     ${stats["poll-vote"]}`);
            console.log(`   🎨 Stickers:  ${stats.sticker}`);
            if (stats.other > 0) console.log(`   ❓ Other:     ${stats.other}`);
            console.log("");

            console.log("─".repeat(50));
            console.log("Recent Messages (all types):\n");

            messages.slice(0, 15).forEach((msg, i) => {
                console.log(formatMessage(msg, i + 1));
                console.log("");
            });

            const regularMessages = messages.filter((m) => getMessageType(m) === "message");
            if (regularMessages.length > 0) {
                console.log("─".repeat(50));
                console.log("Text Messages Only:\n");
                regularMessages.slice(0, 5).forEach((msg, i) => {
                    console.log(formatMessage(msg, i + 1));
                    console.log("");
                });
            }

            const reactions = messages.filter((m) => getMessageType(m) === "reaction");
            if (reactions.length > 0) {
                console.log("─".repeat(50));
                console.log("Reactions Detail:\n");

                const reactionCounts: Record<string, number> = {};
                for (const r of reactions) {
                    const info = REACTION_MAP[r.associatedMessageType || ""];
                    if (info) {
                        const key = `${info.emoji} ${info.name}`;
                        reactionCounts[key] = (reactionCounts[key] || 0) + 1;
                    }
                }
                console.log("   Breakdown:");
                for (const [name, count] of Object.entries(reactionCounts)) {
                    console.log(`      ${name}: ${count}`);
                }
                console.log("");

                reactions.slice(0, 5).forEach((msg, i) => {
                    console.log(formatMessage(msg, i + 1));
                    console.log("");
                });
            }

            const pollsOnly = messages.filter((m) => getMessageType(m) === "poll");
            if (pollsOnly.length > 0) {
                console.log("─".repeat(50));
                console.log("Polls Detail:\n");
                pollsOnly.slice(0, 3).forEach((msg, i) => {
                    console.log(formatMessage(msg, i + 1));
                    console.log("");
                });
            }

            const votesOnly = messages.filter((m) => getMessageType(m) === "poll-vote");
            if (votesOnly.length > 0) {
                console.log("─".repeat(50));
                console.log("Poll Votes Detail:\n");
                votesOnly.slice(0, 5).forEach((msg, i) => {
                    console.log(formatMessage(msg, i + 1));
                    console.log("");
                });
            }
        } catch (error) {
            handleError(error, "Failed to fetch message history");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
