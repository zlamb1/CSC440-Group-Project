/**
 * DO NOT MESS WITH THIS!!!
 * This component invalidates the state on the server-side for Zustand so that client data is not inadvertently leaked.
 */

import {usePostStore} from "@/utils/posts/usePostStore";
import {useRef} from "react";
import {usePublicPostsStore} from "@/utils/posts/usePublicPostsStore";

export function StoreInvalidator() {
    const isReset = useRef<boolean>(false);
    const isServer = typeof document === 'undefined';
    const storeResets = [
        usePostStore((state: any) => state.reset),
        usePublicPostsStore((state: any) => state.reset)
    ];

    if (isServer && !isReset.current) {
        for (const reset of storeResets) {
            try {
                reset();
            } catch (err) {
                console.error(err);
            }
        }

        isReset.current = true;
    }

    return null;
}