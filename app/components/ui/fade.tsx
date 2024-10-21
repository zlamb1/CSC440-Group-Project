import {ReactNode} from "react";
import Transition from "@ui/transition";

export interface FadeProps {
    children: ReactNode;
    show?: boolean;
    transitionFrom?: number;
    transitionTo?: number;
    duration?: number;
    initial?: boolean;
}

export default function Fade({ children, show = true, transitionFrom = 0, transitionTo = 1, duration = 0.2, initial = true }: FadeProps) {
    return (
        <Transition children={children}
                    transition={{ property: 'opacity', transitionFrom, transitionTo }}
                    show={show}
                    duration={duration}
                    initial={initial}
        />
    );
}