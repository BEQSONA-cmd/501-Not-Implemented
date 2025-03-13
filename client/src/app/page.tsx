import GMap from "@/components/GMap";
import { MapProvider } from "@/components/GMap/provider";

export default function Home() {
    return (
        <div>
            <MapProvider>
                <GMap />
            </MapProvider>
        </div>
    );
}
