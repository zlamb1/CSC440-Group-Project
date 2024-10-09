import {useLayoutEffect, useState} from "react";

// https://stackoverflow.com/questions/60755083/how-to-check-if-a-div-is-overflowing-in-react-functional-component

const useOverflow = (ref: any, vertical: boolean, callback: Function) => {
    const [isOverflowed, setOverflowed] = useState<boolean | undefined>(undefined);
    // suppress SSR warning
    if (typeof document !== "undefined" && ref?.current) {
        useLayoutEffect(() => {
            const { current } = ref;
            const { clientWidth, scrollWidth, clientHeight, scrollHeight } = current;
            const trigger = () => {
                const hasOverflow = vertical ? scrollHeight > clientHeight : scrollWidth > clientWidth;
                setOverflowed(hasOverflow);
                if (callback) callback(hasOverflow);
            };
            if (current) {
                trigger();
            }
        }, [callback, ref, vertical]);
    }
    return isOverflowed;
};

export default useOverflow;