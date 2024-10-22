import * as React from "react"

import {cn} from "@/lib/utils"
import {ReactNode, useRef} from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    inputClasses?: string;
    prepend?: ReactNode;
    append?: ReactNode;
}

export default function Input(props: InputProps) {
    const ref = useRef<HTMLInputElement>(null);

    function onClick() {
        if (ref.current) {
            ref.current.focus();
        }
    }

    return (
        <div
            className={cn("w-full flex gap-1 items-center p-1 h-9 border border-input bg-transparent cursor-text " +
                "rounded-md text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 " +
                "focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", props?.className)}
            onClick={onClick}
        >
            {
                props?.prepend ? props.prepend : null
            }
            <input
                {...props}
                className={cn(
                    "flex-grow bg-transparent rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none",
                    props?.inputClasses
                )}
                ref={ref}
            />
            {
                props?.append ? props.append : null
            }
        </div>
    );
}

export {Input}
