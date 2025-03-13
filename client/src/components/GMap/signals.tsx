import { useEffect, useState, useRef } from "react";
import { ITrafficSignal } from "@/types/map";
import data from "@/data/traffic_signals.json"

// const useTrafficSignals = () => {
//     const [trafficSignals, setTrafficSignals] = useState<ITrafficSignal[]>([]);
//     const intervalRef = useRef<NodeJS.Timeout | null>(null);

//     const getSignalState = (time: number, signal: ITrafficSignal) => {
//         const cycleTime = signal.red_time + signal.yellow_time + signal.green_time;
//         const timeInCycle = (time + signal.cycle_offset) % cycleTime;

//         if (timeInCycle < signal.green_time) return "green";
//         if (timeInCycle < signal.green_time + signal.yellow_time) return "yellow";
//         return "red";
//     };

//     const getTimeRemaining = (time: number, signal: ITrafficSignal) => {
//         const cycleTime = signal.red_time + signal.yellow_time + signal.green_time;
//         const timeInCycle = (time + signal.cycle_offset) % cycleTime;

//         if (timeInCycle < signal.green_time) return signal.green_time - timeInCycle;
//         if (timeInCycle < signal.green_time + signal.yellow_time)
//             return signal.green_time + signal.yellow_time - timeInCycle;
//         return cycleTime - timeInCycle;
//     };

//     const updateSignals = () => {
//         const currentTime = Math.floor(Date.now() / 1000);
//         setTrafficSignals((prevSignals) =>
//             prevSignals.map((signal) => ({
//                 ...signal,
//                 state: getSignalState(currentTime, signal),
//                 time_remaining: getTimeRemaining(currentTime, signal),
//             }))
//         );
//     };

//     useEffect(() => {
//         const initializedSignals = traffic_signals.map((signal) => {

//             const yellow_time = 4;
//             const red_time = 10;
//             const green_time = 8;

//             const cycleTime = red_time + yellow_time + green_time;
//             const randomOffset = Math.floor(Math.random() * cycleTime);

//             return {
//                 ...signal,
//                 state: "green",
//                 time_remaining: Math.floor(Math.random() * 10),
//                 cycle_offset: randomOffset,
//                 yellow_time,
//                 red_time,
//                 green_time,
//             };
//         }) as ITrafficSignal[];

//         setTrafficSignals(initializedSignals);

//         intervalRef.current = setInterval(updateSignals, 1000);

//         return () => {
//             if (intervalRef.current) {
//                 clearInterval(intervalRef.current);
//             }
//         };
//     }, []);

//     return { trafficSignals };
// };


/*

export interface ITrafficSignal {
    id: number;
    lat: number;
    lon: number;
    phases: number[]; // green yellow red red-yellow
    sync_time: string;
}

*/

const useTrafficSignals = () => {
    const [trafficSignals, setTrafficSignals] = useState<ITrafficSignal[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getSignalState = (time: number, signal: ITrafficSignal) => {
        const now = new Date().getTime();
        const diff = now - time;
        const phase = Math.floor(diff / 10000) % 4;
        return phase;
    }

    const fetchTrafficSignals = async () => {
        try {
            // const response = await fetch("http://localhost:5000/signals");
            // const data = await response.json();
            // setTrafficSignals(data);

            const newData = data.map((signal: any) => {
                return {
                    ...signal,
                    phases: [20, 2, 30, 1],
                    sync_time: new Date().toISOString(),
                }
            });

            setTrafficSignals(newData as unknown as ITrafficSignal[]);
        } catch (error) {
            console.error("Error fetching traffic signals:", error);
        }
    };

    useEffect(() => {
        fetchTrafficSignals();
        intervalRef.current = setInterval(fetchTrafficSignals, 10000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { getSignalState, trafficSignals };
}

export default useTrafficSignals;