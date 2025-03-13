"use client";

import React, { useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { IPosition } from "@/types/map";
import { useMap } from "./provider";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const NextSignal = ({ lat, lng }: IPosition) => {
    const position = { lat, lng };
    return (
        <div className="absolute text-black p-2 top-0 left-1/2 frame-border bg-white z-10">
            <h1>Closest Signal</h1>
            <p>State: </p>
            <p>Time Remaining: </p>
        </div>
    );
}

function GMap() {
    const { map, position, onLoad, onUnmount, destination, newDestinationRoute, closestSignal, trafficSignals, getSignalState } = useMap();

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        const clickedPosition: IPosition = {
            lat: event.latLng?.lat() ?? 0,
            lng: event.latLng?.lng() ?? 0,
        };
        newDestinationRoute(clickedPosition);
    };

    useEffect(() => {
        if(!position) return ;

        map?.setCenter(position);
        map?.setZoom(17);
    },[position])

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

                    const time = new Date(e.sync_time).getTime();
                    const now = new Date().getTime();
                    const diff = now - time;
                    // TODO: Implement logic to determine the current state of the signal

                    const states = ["green", "yellow", "red", "red-yellow"];

                    const stateIndex = getSignalState(diff, e);
                    let state = states[stateIndex];
                    console.log(state, stateIndex);

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
            {/* {closestSignal && (
                <div className="absolute bg-black text-white p-2 bottom-0 left-0 z-10">
                    <h1>Closest Signal</h1>
                    <p>State: {closestSignal.state}</p>
                    <p>Time Remaining: {closestSignal.time_remaining}</p>
                </div>
            )} */}
        </div>
    );
}

export default React.memo(GMap);
