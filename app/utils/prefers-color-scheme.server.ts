import { createCookie } from "@remix-run/node";
import {prefersColorSchemeCookieName} from "@/utils/prefers-color-scheme";

const isProduction = process.env.NODE_ENV === "production";

export const prefersColorScheme = createCookie(prefersColorSchemeCookieName, {
    maxAge: 60 * 60 * 24 * 365 * 10,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
});