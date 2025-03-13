export interface IPosition {
    lat: number;
    lng: number;
}

export interface ITrafficSignal_OLD {
    id: number;
    lat: number;
    lon: number;

    red_time: number;
    yellow_time: number;
    green_time: number;
    time_remaining: number;
    state: "red" | "yellow" | "green";
    cycle_offset: number; 


    tags: {
        highway: string;
        traffic_signals: string;
        "traffic_signals:direction": string;
    };
}

export interface ITrafficSignal {
    id: number;
    lat: number;
    lon: number;
    phases: number[]; // green yellow red red-yellow
    sync_time: string;
}
