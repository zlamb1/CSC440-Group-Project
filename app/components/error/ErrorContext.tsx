import Transition from "@ui/transition";

export interface ErrorContextProps {
    msg?: string;
}

export function ErrorContext({msg}: ErrorContextProps) {
    return (
        <Transition id={msg}
                    className={`text-red-600 text-xs text-nowrap select-none overflow-hidden`}
                    duration={0.2}
                    initial={true}
                    transition={{ property: 'height', transitionFrom: 0 }}>
            {msg}
        </Transition>
    )
}