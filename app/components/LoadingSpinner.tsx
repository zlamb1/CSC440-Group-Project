import {SVGProps} from "react";
import {cn} from "@/lib/utils";

export interface ISVGProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export const LoadingSpinner = ({
                                 size = 24,
                                 strokeWidth = 2,
                                 className,
                                 color = "currentColor",
                                 ...props
                               }: ISVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
};