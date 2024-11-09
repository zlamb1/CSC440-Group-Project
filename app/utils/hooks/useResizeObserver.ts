import {Dispatch, RefObject, SetStateAction, useEffect, useState} from "react";

type Dimensions = {
    width: number;
    height: number;
};

export default function useResizeObserver<T extends HTMLElement>(options?: { ref: RefObject<T> | HTMLElement }): [ Dimensions, Dispatch<SetStateAction<Dimensions>> ] {
    const [ dimensions, setDimensions ] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const ref = options?.ref ?? document.body;
        const element: Element | null = 'current' in ref ? ref.current : ref;

        if (!element) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!Array.isArray(entries)) return;

            const entry = entries[0];
            if (entry) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        if (element) resizeObserver.observe(element);

        return () => {
            if (element) resizeObserver.unobserve(element);
        };
    });

    return [ dimensions, setDimensions ];
}