import type { AxiosInstance } from "axios";

/**
 * Checks if an error indicates that a chat does not exist.
 */
export function isChatNotExistError(error: unknown): boolean {
    const axiosError = error as { response?: { data?: { error?: { message?: string }; message?: string } } };
    const errorMsg = axiosError?.response?.data?.error?.message || axiosError?.response?.data?.message || "";
    const lowerMsg = errorMsg.toLowerCase();
    return lowerMsg.includes("chat does not exist") || lowerMsg.includes("chat not found");
}

/**
 * Extracts the address from a chatGuid.
 * Expected format: "service;-;address"
 * e.g., "any;-;+1xxxxxxxxxx" -> "+1xxxxxxxxxx"
 * Returns undefined if chatGuid is malformed.
 */
export function extractAddress(chatGuid: string): string | undefined {
    const parts = chatGuid.split(";-;");
    if (parts.length !== 2 || !parts[1]) {
        return undefined;
    }
    return parts[1];
}

/**
 * Creates a chat with an initial message.
 * Returns the created chat's GUID.
 */
export async function createChatWithMessage(options: {
    http: AxiosInstance;
    address: string;
    message: string;
    tempGuid?: string;
    subject?: string;
    effectId?: string;
}): Promise<string> {
    const { http, address, message, tempGuid, subject, effectId } = options;
    try {
        const response = await http.post("/api/v1/chat/new", {
            addresses: [address],
            message,
            tempGuid,
            subject,
            effectId,
        });
        return response.data.data?.guid;
    } catch (error) {
        throw new Error(
            `Failed to create chat with address "${address}": ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}
