import { IPosition, ITrafficSignal } from "@/types/map";
import { getDistance } from "geolib";

export const findTrafficSignal = (positions: IPosition[], signals: ITrafficSignal[]): ITrafficSignal | null => {
    const stepSize = 10; // meters (adjust as needed)

    for (let i = 0; i < positions.length - 1; i++) {
        const start = positions[i];
        const end = positions[i + 1];

        const distanceBetween = getDistance(
            { latitude: start.lat, longitude: start.lng },
            { latitude: end.lat, longitude: end.lng }
        );

        const numSteps = Math.ceil(distanceBetween / stepSize);

        for (let j = 0; j <= numSteps; j++) {
            const fraction = j / numSteps;
            const interpolatedPoint = {
                lat: start.lat + (end.lat - start.lat) * fraction,
                lng: start.lng + (end.lng - start.lng) * fraction,
            };

            const trafficSignal = signals.find((signal) => {
                const signalPosition = { lat: signal.lat, lng: signal.lon };
                const distance = getDistance(
                    { latitude: signalPosition.lat, longitude: signalPosition.lng },
                    { latitude: interpolatedPoint.lat, longitude: interpolatedPoint.lng }
                );

                return distance < 10; // Within 10 meters
            });

            if (trafficSignal)
                return trafficSignal;
                // return {
                //     ...trafficSignal,
                //     state: "green",
                
                //     time_remaining: 8,

                //     yellow_time: 4,
                //     red_time: 10,
                //     green_time: 8,
                // };
        }
    }

    return null;
};
