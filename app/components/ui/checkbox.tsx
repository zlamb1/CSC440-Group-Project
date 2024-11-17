import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"
import {Check} from "lucide-react";
import {useEffect, useState} from "react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => {
      clearTimeout(id);
    }
  }, []);
  const animationDuration = '0.2s';
  return (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "grid place-content-center peer h-4 w-4 shrink-0 rounded-[4px] border-2 border-primary shadow focus-visible:outline-none " +
            "focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary " +
            "data-[state=checked]:text-primary-foreground",
            className
        )}
        style={isMounted ? { transition: `background-color ${animationDuration}` } : undefined}
        {...props}
    >
      <CheckboxPrimitive.Indicator
          className={cn("grid place-content-center text-current")} forceMount
      >
        <svg width={24}
             height={24}
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeDasharray={100}
             strokeDashoffset={100}
             strokeWidth={3}
             strokeLinecap="round"
             strokeLinejoin="round"
             style={{ transition: `stroke-dashoffset ${animationDuration} ease-in-out` }}
             className="z__checkbox-icon__z w-2.5 h-2.5"
        >
          <path d="M20 6 9 17l-5-5" pathLength={100} />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
