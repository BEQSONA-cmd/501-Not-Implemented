"use client";

import { IPosition, ITrafficSignal } from "@/types/map";
import { createContext, use, useCallback, useContext, useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import traffic_signals from "@/data/traffic_signals.json";

import Geolocation from '@react-native-community/geolocation';

interface MapProviderProps{
    position: IPosition;
    destination: IPosition | null;
    setDestination: (destination: IPosition | null) => void;

    onLoad: any;
    onUnmount: any;
    map: google.maps.Map | null;
    isLoaded: boolean;
}

const MapContext = createContext<MapProviderProps | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [position, setPosition] = useState<IPosition | null>(null);
    const [destination, setDestination] = useState<IPosition | null>(null);
    
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(newMap: google.maps.Map) {
        newMap.setZoom(15);

        Geolocation.getCurrentPosition(
            (info) => {
                setPosition({
                    lat: info.coords.latitude,
                    lng: info.coords.longitude,
                });

                newMap?.setCenter({
                    lat: info.coords.latitude,
                    lng: info.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting position:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000,
            }
        )

        setMap(newMap);
    }, []);

    const onUnmount = useCallback(function callback(map: any) {
        setMap(null);
    }, []);

    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            (info) => {
                setPosition({
                    lat: info.coords.latitude,
                    lng: info.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting position:", error);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
            }
        );

        return () => Geolocation.clearWatch(watchId);
    }, []);

    if(!position || !isLoaded) return null;

    return (
        <MapContext.Provider
            value={{
                position,
                destination,
                setDestination,

                isLoaded,

                map,
                onLoad,
                onUnmount,
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
