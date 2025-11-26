export interface ServerMetadataResponse {
    os_version: string;
    server_version: string;
    private_api: boolean;
    helper_connected: boolean;
    detected_icloud?: string;
    detected_icloud_name?: string;
    detected_imessage?: string;
    macos_time_sync?: number | null;
    local_ipv4s?: string[];
    local_ipv6s?: string[];
    computer_id?: string;
}

export interface ServerUpdateData {
    version: string;
    releaseDate?: string;
    releaseNotes?: string;
}

export interface BackupData {
    name: string;
    path?: string;
    createdAt?: number;
}
