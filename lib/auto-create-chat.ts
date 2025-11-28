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
 * e.g., "any;-;+1xxxxxxxxxx" -> "+1xxxxxxxxxx"
 */
export function extractAddress(chatGuid: string): string | undefined {
    return chatGuid.split(";-;")[1];
}

/**
 * Creates a chat with an initial message.
 * Returns the created chat's GUID.
 */
export async function createChatWithMessage(
    http: AxiosInstance,
    address: string,
    message: string,
    tempGuid?: string,
): Promise<string> {
    const response = await http.post("/api/v1/chat/new", {
        addresses: [address],
        message,
        tempGuid,
    });
    return response.data.data?.guid;
}
