import {AnimatePresence, clamp, motion} from "framer-motion";
import React, {useCallback, useState} from "react";

// @ https://github.com/nextui-org/nextui/blob/canary/packages/components/ripple/src/use-ripple.ts#L25

export interface RippleType {
  key: React.Key,
  size: number,
  x: number,
  y: number,
}

function getUniqueID(prefix: string) {
  return `${prefix}-${Math.floor(Math.random() * 1000000)}`;
}

export function useRipple(props: any) {
  const [ripples, setRipples] = useState<RippleType[]>([]);

  const onClick = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = evt.currentTarget;
    const size = Math.max(trigger.clientWidth, trigger.clientHeight);
    const rect = trigger.getBoundingClientRect();
    setRipples((ripples) => [
      ...ripples, {
        key: getUniqueID(ripples.length.toString()),
        size: size,
        x: evt.clientX - rect.left - size / 2,
        y: evt.clientY - rect.top - size / 2,
      }
    ]);
  }, []);

  const onClear = useCallback((key: React.Key) => {
    setRipples((prevState) => prevState.filter((ripple) => ripple.key !== key));
  }, []);

  const color = props?.rippleColor ?? 'currentColor';
  return {ripples, onClick, onClear, color};
}

export function Ripple(props: any) {
  const {ripples = [], style, color = "currentColor", onClear} = props;

  function transformColor(color: any) {
    return color;
  }

  return (
    <>
      {ripples.map((ripple: RippleType) => {
        const duration = clamp(0.01 * ripple.size, 0.35, ripple.size > 100 ? 0.75 : 0.5);
        return (
          <AnimatePresence key={ripple.key}>
            <motion.span animate={{transform: "scale(2)", opacity: 0}}
                         className="ripple"
                         exit={{opacity: 0}}
                         initial={{transform: "scale(0)", opacity: 0.35}}
                         style={{
                           position: "absolute",
                           backgroundColor: transformColor(color),
                           borderRadius: "100%",
                           pointerEvents: "none",
                           overflow: "hidden",
                           zIndex: 0,
                           top: ripple.y,
                           left: ripple.x,
                           width: `${ripple.size}px`,
                           height: `${ripple.size}px`,
                           ...style,
                         }}
                         transition={{duration}}
                         onAnimationComplete={() => {
                           onClear(ripple.key);
                         }}
            />
          </AnimatePresence>
        )
      })}
    </>
  )
}