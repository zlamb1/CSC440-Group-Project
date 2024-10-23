import {ReactNode} from "react";

export default function Omit({ children, omit = false, fallback }: { children: ReactNode, omit?: boolean, fallback?: ReactNode }) {
    if (omit) {
        if (fallback) {
            return fallback;
        } else {
            return null;
        }
    } else {
        return children;
    }
}