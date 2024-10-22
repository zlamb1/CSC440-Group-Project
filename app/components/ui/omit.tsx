import {ReactNode} from "react";

export default function Omit({ children, omit = false }: { children: ReactNode, omit?: boolean }) {
    if (omit) {
        return null;
    } else {
        return children;
    }
}