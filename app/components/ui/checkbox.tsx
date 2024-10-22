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
            "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none " +
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
        <Check strokeWidth={3} style={isMounted ? { animationDuration } : undefined} className="z__checkbox-icon__z w-2.5 h-2.5"/>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
