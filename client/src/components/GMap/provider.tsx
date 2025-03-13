'use client';

import { IPosition, ITrafficSignal } from "@/types/map";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import Geolocation from '@react-native-community/geolocation';
import { getRhumbLineBearing, computeDestinationPoint, getDistance } from "geolib"; // Import required functions
import { fetchRoute } from "./api";
import { findTrafficSignal } from "./traffic";
import useTrafficSignals from "./signals";

interface MapProviderProps {
    position: IPosition | null;
    destination: IPosition | null;
    newDestinationRoute: (newDest: IPosition | null) => Promise<void>;
    onLoad: any;
    onUnmount: any;
    map: google.maps.Map | null;
    closestSignal: ITrafficSignal | null;   
    isLoaded: boolean;
    trafficSignals: ITrafficSignal[];
    getSignalState: (time: number, signal: ITrafficSignal) => number;
}

const MapContext = createContext<MapProviderProps | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [position, setPosition] = useState<IPosition | null>(null);
    const [destination, setDestination] = useState<IPosition | null>(null);
    const [closestSignal, setClosestSignal] = useState<ITrafficSignal | null>(null);
    const { trafficSignals, getSignalState } = useTrafficSignals();
    
    const [routeLine, setRouteLine] = useState<google.maps.Polyline | null>(null);
    const [route, setRoute] = useState<IPosition[]>([]);

    
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((newMap: google.maps.Map) => {
        newMap.setZoom(15);

        Geolocation.getCurrentPosition(
            (info) => {
                const newPosition = { lat: info.coords.latitude, lng: info.coords.longitude };
                newMap?.setCenter(newPosition);
                setPosition(newPosition);
            },
            (error) => {
                console.error("Error getting position:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000,
            }
        );

        setMap(newMap);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Real-time position tracking
    useEffect(() => {
        // const watchId = Geolocation.watchPosition(
        //     (info) => {
        //         setPosition({
        //             lat: info.coords.latitude,
        //             lng: info.coords.longitude,
        //         });
        //     },
        //     (error) => {
        //         console.error("Error getting position:", error);
        //     },
        //     {
        //         enableHighAccuracy: true,
        //         distanceFilter: 10,
        //         interval: 5000,
        //     }
        // );

        // return () => Geolocation.clearWatch(watchId);
    }, []);

    // Function to move 10 meters closer to the destination using geolib
    const moveForward = () => {
        if (!position || !route.length) return;

        // Find the next point on the route
        let closestPointIndex = -1;
        let minDistance = Infinity;

        // Find the closest point to the user
        for (let i = 0; i < route.length; i++) {
            const distance = getDistance(position, route[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestPointIndex = i;
            }
        }

        if (closestPointIndex === -1 || closestPointIndex === route.length - 1) {
            // If we're already at the destination or couldn't find a point, do nothing
            console.log("No route available or destination reached.");
            return;
        }

        // Get the next point on the route
        const nextPoint = route[closestPointIndex + 1];

        // Get the bearing (direction) from the current position to the next point
        const bearing = getRhumbLineBearing(position, nextPoint);

        // Calculate the new position by moving 10 meters forward along the bearing
        const newPosition = computeDestinationPoint(position, 10, bearing);

        // Update the position state with the new coordinates
        setPosition({
            lat: newPosition.latitude,
            lng: newPosition.longitude,
        });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === "Space") {
                console.log(route);
                event.preventDefault();
                moveForward();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [route, position, destination]);

    async function newDestinationRoute(newDest: IPosition | null): Promise<void> {
        routeLine?.setMap(null);
        if (!position) return;
        setDestination(newDest)

        if (!newDest) return;
        const path = await fetchRoute(position, newDest);
        if(!path) return;
        const newRouteLine = new google.maps.Polyline({
            path,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        
        const traffic = findTrafficSignal(path, trafficSignals);
        setClosestSignal(traffic);
        
        newRouteLine.setMap(map);
        setRouteLine(newRouteLine);
        setRoute(path);
    }

    if (!isLoaded) return null;

    return (
        <MapContext.Provider
            value={{
                position,
                destination,
                newDestinationRoute,
                isLoaded,
                closestSignal,
                map,
                onLoad,
                onUnmount,
                trafficSignals,
                getSignalState
            }}
        >
            {children}
        </MapContext.Provider>
    );
}

export function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within MapProvider");
    }
    return context;
}