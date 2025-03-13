import { IPosition } from "@/types/map";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export const fetchTrafficSignals = async () => {


    

}

export const fetchRoute = async (origin: IPosition, destination: IPosition) => {
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
            return path;
        } else {
            console.error("Error fetching route:", data);
        }
    } catch (error) {
        console.error("Error with route request:", error);
    }
};


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