import React from "react";

export interface ProgressCircleProps {
    percentage?: number,
    strokeWidth?: number,
    hideAtZero?: boolean,
}

export default function ProgressCircle({ percentage = 0, strokeWidth = 3, hideAtZero = true }: ProgressCircleProps) {
    return (
        <svg
            className={"fill-transparent flex w-[24px] h-[24px] overflow-hidden " + (percentage === 0 && hideAtZero ? 'hidden' : '')}>
            <circle className="stroke-gray-600" style={{strokeWidth}} cx="12" cy="12" r="10" />
            <circle className="stroke-primary"
                    style={{strokeWidth, transition: 'stroke-dasharray 0.25s'}}
                    cx="12" cy="12" r="10"
                    strokeDasharray={percentage + ',' + (100 - percentage)}
                    strokeDashoffset="25"
                    pathLength="100" />
        </svg>
    );
}