import {AnimatePresence, motion} from "framer-motion";
import {Key, ReactNode} from "react";

export interface SingleValueTransition {
    property: string;
    transitionFrom?: number | string;
    transitionTo?: number | string;
}

export interface MultipleValueTransition {
    initial?: any;
    animate?: any;
    exit?: any;
}

export interface TransitionProps {
    children: ReactNode;
    transition: SingleValueTransition | MultipleValueTransition;
    id?: Key | null;
    className?: string;
    show?: boolean;
    duration?: number;
    initial?: boolean;
    fallback?: ReactNode;
}

export default function Transition({ children, transition, id, className, show = true, duration = 0.2, initial = true, fallback = null }: TransitionProps) {
    function getProps() {
        if ('property' in transition) {
            if (transition.transitionTo === undefined) {
                transition.transitionTo = 'initial';
            }

            return {
                initial: { [transition.property]: transition.transitionFrom },
                animate: { [transition.property]: transition.transitionTo   },
                exit:    { [transition.property]: transition.transitionFrom },
            }
        } else {
            return transition;
        }
    }

    return (
        <AnimatePresence mode="wait" initial={initial}>
            {
                show ?
                    <motion.div key={id} className={className} transition={{duration}} {...getProps()}>
                        {children}
                    </motion.div>
                    : fallback
            }
        </AnimatePresence>
    );
}