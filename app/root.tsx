import {
    Links,
    Meta, Outlet,
    Scripts,
} from "@remix-run/react";

import NavBar from "@components/NavBar";

import type {LinksFunction} from "@remix-run/node";
import stylesheet from "@css/tailwind.css?url";
import React from "react";
import ThemeScript from "@/utils/theme-script";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
];

export function Layout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ThemeScript />
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,AA"
                />
                <Meta/>
                <Links/>
                <title>Stories</title>
            </head>
            <body>
                <div className="flex flex-col" style={{minHeight: '100vh'}}>
                    <NavBar />
                    {children}
                </div>
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    return <Outlet />
}