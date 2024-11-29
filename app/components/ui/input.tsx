import * as React from "react"

import {cn} from "@/lib/utils"
import {forwardRef, ReactNode, useRef} from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    inputClasses?: string;
    prepend?: ReactNode;
    append?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = ref ?? useRef<HTMLInputElement | null>(null);

    function onClick() {
        if ("current" in inputRef) {
            inputRef?.current?.focus();
        } else if (containerRef.current) {
            const input = containerRef.current.querySelector('input');
            if (input) {
                input.focus();
            }
        }
    }

    const { inputClasses, ...propsOmitInputClasses } = props;

    return (
        <div
            className={cn("w-full flex gap-1 items-center py-1 px-2 h-9 border border-input bg-transparent cursor-text " +
                "rounded-md text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 " +
                "focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
            onClick={onClick}
            ref={containerRef}
        >
            {
                props?.prepend ? props.prepend : null
            }
            <input
                type={type}
                className={cn(
                    "flex-grow bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none",
                    props?.inputClasses
                )}
                ref={inputRef}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                {...propsOmitInputClasses}
            />
            {
                props?.append ? props.append : null
            }
        </div>
    )
});

export {Input}
