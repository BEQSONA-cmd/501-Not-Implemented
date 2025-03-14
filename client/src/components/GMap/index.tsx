"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { IPosition, ITrafficSignal } from "@/types/map";
import { useMap } from "./provider";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const NextSignal = ({ lat, lng }: IPosition) => {
    return (
        <div className="absolute text-black p-2 top-0 left-1/2 frame-border bg-white z-10">
            <h1>Closest Signal</h1>
            <p>State: </p>
            <p>Time Remaining: </p>
        </div>
    );
};

const getCurrentSignalState = (signal: ITrafficSignal, currentTime: number) => {
    const fixedDateString = signal.sync_time.replace(/T(\d{2}):(\d{2}):(\d)\./, "T$1:$2:0$3.");

    const pastDate = new Date(fixedDateString);

    if (isNaN(pastDate.getTime())) {
        console.error("Invalid sync_time:", fixedDateString);
        return { state: "unknown", timeRemaining: 0 };
    }

    const pastTimestamp = Math.floor(pastDate.getTime() / 1000);
    const timeElapsed = currentTime - pastTimestamp;

    const cycleLength = signal.phases.reduce((a, b) => a + b, 0);
    const timeInCycle = timeElapsed % cycleLength;

    let cumulativeTime = 0;
    const states = ["green", "yellow", "red", "red-yellow"];

    for (let i = 0; i < signal.phases.length; i++) {
        cumulativeTime += signal.phases[i];

        if (timeInCycle < cumulativeTime) {
            const timeRemaining = cumulativeTime - timeInCycle;
            return { state: states[i], timeRemaining };
        }
    }

    return { state: "unknown", timeRemaining: 0 };
};

function GMap() {
    const {
        map,
        position,
        onLoad,
        onUnmount,
        destination,
        newDestinationRoute,
        closestSignal,
        trafficSignals,
    } = useMap();
    const [currentTime, setCurrentTime] = useState(Math.floor(new Date().getTime() / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        const clickedPosition: IPosition = {
            lat: event.latLng?.lat() ?? 0,
            lng: event.latLng?.lng() ?? 0,
        };
        newDestinationRoute(clickedPosition);
    };

    useEffect(() => {
        if (!position) return;
        map?.setCenter(position);
        map?.setZoom(17);
    }, [position]);

    return (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
            >
                {position && <Marker position={position} />}
                {destination && <Marker position={destination} />}
                {trafficSignals.map((e) => {
                    const signal_pos: IPosition = {
                        lat: e.lat,
                        lng: e.lon,
                    };

                    const { state } = getCurrentSignalState(e, currentTime);

                    return (
                        <Marker
                            key={e.id}
                            position={signal_pos}
                            icon={{
                                url: `/${state}.png`,
                                scaledSize: new google.maps.Size(32, 32),
                                anchor: new google.maps.Point(16, 16),
                            }}
                        />
                    );
                })}

                {closestSignal && (
                    <>
                        <Marker position={{ lat: closestSignal.lat, lng: closestSignal.lon }} />
                        <NextSignal lat={closestSignal.lat} lng={closestSignal.lon} />
                    </>
                )}
            </GoogleMap>
        </div>
    );
}

export default React.memo(GMap);
