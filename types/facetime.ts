import type { HandleResponse } from "./handle";

export interface FaceTimeStatusData {
    uuid: string;
    status_id: number;
    status: string;
    ended_error: string;
    ended_reason: string;
    address: string;
    handle?: HandleResponse | null;
    image_url: string;
    is_outgoing: boolean;
    is_audio: boolean;
    is_video: boolean;
    url?: string | null;
}
