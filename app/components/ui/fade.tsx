import {Key, ReactElement, ReactNode} from "react";
import Transition from "@ui/transition";

export interface FadeProps {
    children: ReactNode;
    id?: Key | null;
    show?: boolean;
    transitionFrom?: number;
    transitionTo?: number;
    duration?: number;
    initial?: boolean;
    fallback?: ReactNode;
    container?: ReactElement;
}

export default function Fade({ children, id, show = true, transitionFrom = 0, transitionTo = 1, duration = 0.2, initial = true, fallback, container }: FadeProps) {
    return (
        <Transition children={children}
                    id={id}
                    transition={{ property: 'opacity', transitionFrom, transitionTo }}
                    show={show}
                    duration={duration}
                    initial={initial}
                    fallback={fallback}
                    container={container}
        />
    );
}