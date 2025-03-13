import { ITrafficSignal } from "@/types/map";
import { useEffect, useRef, useState } from "react";


const useClosestSignal = () => {
    const [closestSignal, setClosestSignal] = useState<ITrafficSignal | null>(null);

    const setNewClosestSignal = (signal: ITrafficSignal | null) => {
        setClosestSignal(signal);
    };

    return { closestSignal, setNewClosestSignal };
};

export default useClosestSignal;
