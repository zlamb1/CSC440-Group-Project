import {AnimatePresence, motion} from "framer-motion";
import {cloneElement, Key, ReactElement, ReactNode} from "react";

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
  container?: ReactElement;
}

export default function Transition({
                                     children,
                                     transition,
                                     id,
                                     className,
                                     show = true,
                                     duration = 0.2,
                                     initial = true,
                                     fallback = null,
                                     container
                                   }: TransitionProps) {
  function getProps() {
    if ('property' in transition) {
      if (transition.transitionTo === undefined) {
        transition.transitionTo = 'initial';
      }

      return {
        initial: {[transition.property]: transition.transitionFrom},
        animate: {[transition.property]: transition.transitionTo},
        exit: {[transition.property]: transition.transitionFrom},
      }
    } else {
      return transition;
    }
  }

  function getFallbackWithContainer() {
    if (fallback && container) {
      return cloneElement(container, {
        ...container.props,
        children: fallback
      });
    }

    return null;
  }

  if (container) {
    return (
      <AnimatePresence mode="wait" initial={initial}>
        {
          show ? cloneElement(container, {
            ...container.props,
            children:
              <motion.div key={id} className={className} transition={{duration}} {...getProps()}>
                {children}
              </motion.div>
          }) : getFallbackWithContainer()
        }
      </AnimatePresence>
    );
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