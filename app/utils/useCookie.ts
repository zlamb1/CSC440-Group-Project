import {useEffect, useState} from "react";

export default function useCookie(name: string, options?: { initial?: string, watch?: boolean, pollRate?: number, path?: string, maxAge?: number, sameSite?: string }) {
    const [ cookie, _setCookie ] = useState<string | null>(options?.initial ?? null);

    const watch = options?.watch;
    const pollRate = options?.pollRate ?? 500;
    const path = options?.path ?? '/';
    const maxAge = options?.maxAge ?? 24 * 60 * 60 * 24 * 365;
    const sameSite = options?.sameSite ?? 'Lax';

    function getCookie() {
        const cookies = decodeURIComponent(document.cookie)?.split(';');

        for (let i = 0; i < cookies?.length; i++) {
            const cookie = cookies[i]?.trim();
            if (cookie?.indexOf(name) === 0) {
                return cookie.substring(name.length + 1);
            }
        }

        return null;
    }

    useEffect(() => {
        _setCookie(getCookie());
    }, []);

    useEffect(() => {
        if (watch) {
            const id = setInterval(() => {
                const value = getCookie();
                if (cookie !== value) {
                    _setCookie(value ?? null);
                }
            }, pollRate);

            return () => clearInterval(id);
        }
    });

    function setCookie(value: string) {
        _setCookie(() => {
            document.cookie = `${name}=${value}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
            return value;
        });
    }

    return { cookie, setCookie };
}