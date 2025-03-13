import GMap from "@/components/GMap";
import { MapProvider } from "@/components/GMap/provider";
import GoogleMap from "@/components/Map";

export default function Home() {
    return (
        <div>
            <MapProvider>
                <GMap />
            </MapProvider>
        </div>
    );
}
