import type { MessageResponse } from "../types/message";
import type { PollDefinition, PollOption, PollVote, PollVoteResponse } from "../types/poll";

export const POLL_BALLOON_BUNDLE_ID =
    "com.apple.messages.MSMessageExtensionBalloonPlugin:0000000000:com.apple.messages.Polls";

const pollCache = new Map<string, ParsedPoll>();

export function cachePoll(messageGuid: string, poll: ParsedPoll): void {
    pollCache.set(messageGuid, poll);
}

export function getCachedPoll(messageGuid: string): ParsedPoll | null {
    return pollCache.get(messageGuid) ?? null;
}

export function getOptionTextById(optionId: string): string | null {
    for (const poll of pollCache.values()) {
        const option = poll.options.find((o) => o.optionIdentifier === optionId);
        if (option) return option.text;
    }
    return null;
}

export function isPollMessage(message: MessageResponse): boolean {
    return message.balloonBundleId === POLL_BALLOON_BUNDLE_ID;
}

export function isPollVote(message: MessageResponse): boolean {
    return isPollMessage(message) && message.associatedMessageType === "4000";
}

export interface ParsedPoll {
    title: string;
    creatorHandle: string;
    options: PollOption[];
}

export interface ParsedPollVote {
    votes: PollVote[];
}

function extractDataUrl(payloadData: NodeJS.Dict<any>[] | null | undefined): string | null {
    if (!payloadData || payloadData.length === 0) return null;

    const payload = payloadData[0];
    if (!payload) return null;

    if (payload.URL && typeof payload.URL === "string") {
        return payload.URL;
    }

    const objects = payload.$objects;
    if (Array.isArray(objects)) {
        for (const obj of objects) {
            if (typeof obj === "string" && obj.startsWith("data:,")) {
                return obj;
            }
            if (typeof obj === "object" && obj !== null) {
                if (obj["NS.relative"] && typeof obj["NS.relative"] === "object") {
                    const relativeObj = objects[obj["NS.relative"].UID];
                    if (typeof relativeObj === "string" && relativeObj.startsWith("data:,")) {
                        return relativeObj;
                    }
                }
            }
        }
    }

    return null;
}

function parseDataUrl(dataUrl: string): unknown | null {
    try {
        const prefix = "data:,";
        if (!dataUrl.startsWith(prefix)) return null;

        let data = dataUrl.slice(prefix.length);
        const queryIndex = data.indexOf("?");
        if (queryIndex !== -1) {
            data = data.slice(0, queryIndex);
        }

        data = decodeURIComponent(data);

        try {
            return JSON.parse(data);
        } catch {
            const decoded = Buffer.from(data, "base64").toString("utf-8");
            return JSON.parse(decoded);
        }
    } catch {
        return null;
    }
}

export function parsePollDefinition(message: MessageResponse): ParsedPoll | null {
    if (!isPollMessage(message)) return null;
    if (isPollVote(message)) return null; // Vote messages don't contain the poll definition

    const dataUrl = extractDataUrl(message.payloadData);
    if (!dataUrl) return null;

    const data = parseDataUrl(dataUrl) as PollDefinition | null;
    if (!data || !data.item) return null;

    const parsed: ParsedPoll = {
        title: data.item.title || "",
        creatorHandle: data.item.creatorHandle || "",
        options: data.item.orderedPollOptions || [],
    };

    if (message.guid) {
        cachePoll(message.guid, parsed);
    }

    return parsed;
}

export function parsePollVotes(message: MessageResponse): ParsedPollVote | null {
    if (!isPollMessage(message)) return null;
    if (!isPollVote(message)) return null;

    const dataUrl = extractDataUrl(message.payloadData);
    if (!dataUrl) return null;

    const data = parseDataUrl(dataUrl) as PollVoteResponse | null;
    if (!data || !data.item) return null;

    return {
        votes: data.item.votes || [],
    };
}

export function getPollSummary(message: MessageResponse): string {
    if (!isPollMessage(message)) {
        return message.text || "(no text)";
    }

    if (isPollVote(message)) {
        const voteData = parsePollVotes(message);
        if (voteData && voteData.votes.length > 0) {
            const votes = voteData.votes
                .map((v) => {
                    const optionText = getOptionTextById(v.voteOptionIdentifier);
                    const optionDisplay = optionText ? `"${optionText}"` : `option ${v.voteOptionIdentifier}`;
                    return `${v.participantHandle || "Someone"} voted ${optionDisplay}`;
                })
                .join(", ");
            return `[Poll Vote] ${votes}`;
        }
        return "[Poll Vote]";
    }

    const pollData = parsePollDefinition(message);
    if (pollData) {
        const title = pollData.title ? `"${pollData.title}"` : "(untitled poll)";
        const optionsList = pollData.options.map((opt, i) => `  ${i + 1}. ${opt.text}`).join("\n");
        return `[Poll] ${title}\n${optionsList}`;
    }

    return "[Poll] (unable to parse)";
}

export function getPollOneLiner(message: MessageResponse): string {
    if (!isPollMessage(message)) {
        return message.text || "(no text)";
    }

    if (isPollVote(message)) {
        const voteData = parsePollVotes(message);
        if (voteData && voteData.votes.length > 0) {
            return `[Poll Vote] ${voteData.votes.length} vote(s)`;
        }
        return "[Poll Vote]";
    }

    const pollData = parsePollDefinition(message);
    if (pollData) {
        const title = pollData.title || "Poll";
        const optionsPreview = pollData.options
            .slice(0, 2)
            .map((o) => o.text)
            .join(", ");
        const moreOptions = pollData.options.length > 2 ? `, +${pollData.options.length - 2} more` : "";
        return `[${title}] ${optionsPreview}${moreOptions}`;
    }

    return "[Poll]";
}
