import {Key, ReactElement, ReactNode} from "react";
import Transition from "@ui/transition";

export interface FadeProps {
  children: ReactNode;
  id?: Key | null;
  show?: boolean;
  className?: string;
  transitionFrom?: number;
  transitionTo?: number;
  duration?: number;
  initial?: boolean;
  fallback?: ReactNode;
  container?: ReactElement;
}

export default function Fade({
                               children,
                               id,
                               show = true,
                               className,
                               transitionFrom = 0,
                               transitionTo = 1,
                               duration = 0.2,
                               initial = true,
                               fallback,
                               container
                             }: FadeProps) {
  return (
    <Transition children={children}
                id={id}
                transition={{property: 'opacity', transitionFrom, transitionTo}}
                show={show}
                className={className}
                duration={duration}
                initial={initial}
                fallback={fallback}
                container={container}
    />
  );
}