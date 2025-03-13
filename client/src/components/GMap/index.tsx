"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { IPosition } from "@/types/map";
import { useMap } from "./provider";
import { findTrafficSignal } from "./traffic";
import useClosestSignal from "./closest";
import useTrafficSignals from "./signals";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

function GMap() {
    const { map, position, onLoad, onUnmount, destination, setDestination } = useMap();
    const { closestSignal, setNewClosestSignal } = useClosestSignal();
    const { trafficSignals } = useTrafficSignals();

    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        const clickedPosition: IPosition = {
            lat: event.latLng?.lat() ?? 0,
            lng: event.latLng?.lng() ?? 0,
        };
        setDestination(clickedPosition);
    };

    const fetchRoute = async (origin: IPosition, destination: IPosition) => {
        polyline?.setMap(null);

        const requestBody = {
            origin: {
                location: {
                    latLng: {
                        latitude: origin.lat,
                        longitude: origin.lng,
                    },
                },
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.lat,
                        longitude: destination.lng,
                    },
                },
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            computeAlternativeRoutes: false,
            routeModifiers: {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false,
            },
            languageCode: "en-US",
            units: "IMPERIAL",
        };

        try {
            const response = await fetch(
                "https://routes.googleapis.com/directions/v2:computeRoutes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": API_KEY!,
                        "X-Goog-FieldMask":
                            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json();
            if (response.ok) {

                const dir = data.routes[0];
                const path = decodePolyline(dir.polyline.encodedPolyline);

                const flightPath = new google.maps.Polyline({
                    path,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                });

                const traffic = findTrafficSignal(path, trafficSignals);
                setNewClosestSignal(traffic);

                flightPath.setMap(map);
                setPolyline(flightPath);
            } else {
                console.error("Error fetching route:", data);
            }
        } catch (error) {
            console.error("Error with route request:", error);
        }
    };
    useEffect(() => {
        if (destination && position) {
            fetchRoute(position, destination);
        }
    }, [destination]);

    return (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
            >
                <Marker position={position} />
                {destination && <Marker position={destination} />}
                {trafficSignals.map((e) => {
                    const signal_pos: IPosition = {
                        lat: e.lat,
                        lng: e.lon,
                    };

                    return (
                        <Marker
                            key={e.id}
                            position={signal_pos}
                            icon={{
                                url: `/${e.state}.png`,
                                scaledSize: new google.maps.Size(32, 32),
                                anchor: new google.maps.Point(16, 16),
                            }}
                        />
                    );
                })}

                {closestSignal && (
                    <Marker
                        position={{ lat: closestSignal.lat, lng: closestSignal.lon }}
                    />
                )}
            </GoogleMap>
            {closestSignal && (
                <div className="absolute bg-black text-white p-2 bottom-0 left-0 z-10">
                    <h1>Closest Signal</h1>
                    <p>State: {closestSignal.state}</p>
                    <p>Time Remaining: {closestSignal.time_remaining}</p>
                </div>
            )}
        </div>
    );
}

function decodePolyline(encoded: string) {
    let points = [];
    let index = 0,
        len = encoded.length;
    let lat = 0,
        lng = 0;

    while (index < len) {
        let byte,
            shift = 0,
            result = 0;
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        let dLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lat += dLat;

        shift = 0;
        result = 0;
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        let dLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lng += dLng;

        points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
}

export default React.memo(GMap);
