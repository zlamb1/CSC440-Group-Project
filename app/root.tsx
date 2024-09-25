import {
    Links,
    Meta,
    Scripts,
} from "@remix-run/react";

import MyApp from "@components/MyApp";

import type {LinksFunction} from "@remix-run/node";
import stylesheet from "@css/tailwind.css?url";
import React from "react";
import ThemeHandler from "@/utils/theme-script";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
];

export default function App() {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ThemeHandler />
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,AA"
                />
                <Meta/>
                <Links/>
                <title>Stories</title>
            </head>
            <body>
                <MyApp />
                <Scripts />
            </body>
        </html>
    )
}