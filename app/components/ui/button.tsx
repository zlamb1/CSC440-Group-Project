import * as React from "react"
import {Slot, Slottable} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import {cn} from "@/lib/utils"
import {Ripple, useRipple} from "@components/ui/ripple";
import {motion, useAnimate} from 'framer-motion';

const buttonVariants = cva(
    "flex items-center justify-center whitespace-nowrap relative overflow-hidden rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                edit: "bg-blue-700 shadow-sm hover:bg-blue-700/90 text-white",
                outline:
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void,
    asChild?: boolean,
    containerClass?: string,
    noClickAnimation?: boolean,
    autoComplete?: string,
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, onClick, containerClass, variant, size, asChild = false, noClickAnimation = false, children, ...props}, ref) => {
        const Comp = asChild ? Slot : "button"
        const RippleProps = useRipple(props);
        const [scope, animate] = useAnimate();
        const _onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
            RippleProps.onClick(evt);
            if (!noClickAnimation) {
                animate(scope.current, {
                    scale: [ 0.9, 1 ]
                });
            }
            if (onClick) onClick(evt);
        }
        if (props.hidden) {
            return null;
        }
        return (
            <motion.div className={containerClass ?? "w-fit"} ref={scope}>
                <Comp onClick={_onClick} className={cn(buttonVariants({variant, size, className}))} ref={ref} autoComplete="off" {...props}>
                    <Slottable>{children}</Slottable>
                    <Ripple {...RippleProps} />
                </Comp>
            </motion.div>
        );
    }
)


export {Button, buttonVariants}
