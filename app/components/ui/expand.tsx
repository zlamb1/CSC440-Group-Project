import {Key, ReactElement, ReactNode} from "react";
import Transition from "@ui/transition";

export interface ExpandProps {
  children: ReactNode;
  id?: Key | null;
  show?: boolean;
  className?: string;
  transitionFrom?: number | string;
  transitionTo?: number | string;
  duration?: number;
  initial?: boolean;
  fallback?: ReactNode;
  container?: ReactElement;
  horizontal?: boolean;
  layout?: boolean;
}

export default function Expand({
                                 children,
                                 id,
                                 show = true,
                                 className,
                                 transitionFrom = 0,
                                 transitionTo = 'auto',
                                 duration = 0.2,
                                 initial = true,
                                 fallback,
                                 container,
                                 horizontal = false,
                                 layout = false,
                               }: ExpandProps) {
  return (
    <Transition children={children}
                id={id}
                transition={{property: horizontal ? 'width' : 'height', transitionFrom, transitionTo}}
                show={show}
                className={className}
                duration={duration}
                initial={initial}
                fallback={fallback}
                container={container}
                layout={layout}
    />
  );
}