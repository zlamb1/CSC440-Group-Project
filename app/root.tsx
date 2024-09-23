import {
    Links,
    Meta,
    Scripts, useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";

import MyApp from "@components/MyApp";

import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import stylesheet from "@css/tailwind.css?url";
import React, {StrictMode} from "react";
import {ThemeClientScript} from "@/utils/theme-script";
import {defaultColorScheme} from "@/utils/prefers-color-scheme";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
];

export async function loader({request}: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    try {
        const cookie = cookieHeader?.split('=')[1];
        if (cookie) {
            return json({prefersColorScheme: cookie });
        } else {
            return json({ prefersColorScheme: defaultColorScheme })
        }
    } catch (exc) {
        return json({ prefersColorScheme: defaultColorScheme });
    }
}

export default function App({children}: {children?: React.ReactNode}) {
    const { prefersColorScheme } = useLoaderData<typeof loader>();
    return (
        <html lang="en" className={prefersColorScheme} data-theme={prefersColorScheme} suppressHydrationWarning>
            <head>
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,AA"
                />
                <Meta />
                <Links />
                <title>Stories</title>
            </head>
            <body>
                <ThemeClientScript />
                <StrictMode>
                    <div id="root" className="flex p-6">
                        <MyApp />
                    </div>
                </StrictMode>
                <Scripts />
            </body>
        </html>
    )
}