export interface FindMyLocationItem {
    handle: string | null;
    coordinates: [number, number];
    long_address: string | null;
    short_address: string | null;
    subtitle: string | null;
    title: string | null;
    last_updated: number;
    is_locating_in_progress: 0 | 1 | boolean;
    status: "legacy" | "live" | "shallow";
    expiry?: number | null;
}
