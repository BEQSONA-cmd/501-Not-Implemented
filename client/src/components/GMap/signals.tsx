import { useEffect, useState, useRef } from "react";
import traffic_signals from "@/data/traffic_signals.json";
import { ITrafficSignal } from "@/types/map";


const useTrafficSignals = () => {
    const [trafficSignals, setTrafficSignals] = useState<ITrafficSignal[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getSignalState = (time: number, signal: ITrafficSignal) => {
        const cycleTime = signal.red_time + signal.yellow_time + signal.green_time;
        const timeInCycle = (time + signal.cycle_offset) % cycleTime;

        if (timeInCycle < signal.green_time) return "green";
        if (timeInCycle < signal.green_time + signal.yellow_time) return "yellow";
        return "red";
    };

    const getTimeRemaining = (time: number, signal: ITrafficSignal) => {
        const cycleTime = signal.red_time + signal.yellow_time + signal.green_time;
        const timeInCycle = (time + signal.cycle_offset) % cycleTime;

        if (timeInCycle < signal.green_time) return signal.green_time - timeInCycle;
        if (timeInCycle < signal.green_time + signal.yellow_time)
            return signal.green_time + signal.yellow_time - timeInCycle;
        return cycleTime - timeInCycle;
    };

    const updateSignals = () => {
        const currentTime = Math.floor(Date.now() / 1000);
        setTrafficSignals((prevSignals) =>
            prevSignals.map((signal) => ({
                ...signal,
                state: getSignalState(currentTime, signal),
                time_remaining: getTimeRemaining(currentTime, signal),
            }))
        );
    };

    useEffect(() => {
        const initializedSignals = traffic_signals.map((signal) => {

            const yellow_time = 4;
            const red_time = 10;
            const green_time = 8;

            const cycleTime = red_time + yellow_time + green_time;
            const randomOffset = Math.floor(Math.random() * cycleTime);

            return {
                ...signal,
                state: "green",
                time_remaining: Math.floor(Math.random() * 10),
                cycle_offset: randomOffset,
                yellow_time,
                red_time,
                green_time,
            };
        }) as ITrafficSignal[];

        setTrafficSignals(initializedSignals);

        intervalRef.current = setInterval(updateSignals, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { trafficSignals };
};

export default useTrafficSignals;