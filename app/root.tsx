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
                <ThemeScript/>
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,AA"
                />
                <meta charSet="utf-8"/>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta/>
                <Links/>
                <title>Stories</title>
            </head>
            <body>
                <div className="flex flex-col" style={{minHeight: '100vh'}}>
                    <NavBar/>
                    {children}
                </div>
                <Scripts />
            </body>
        </html>
    )
}

export function ErrorBoundary() {
    return <div className="mx-8 sm:mx-16 md:mx- 32 lg:mx-48 xl:mx-64 select-none flex-grow flex flex-col items-center mt-32 gap-1">
        <p className="text-5xl font-bold">Oops!</p>
        <p className="text-gray-800 dark:text-gray-300 font-extralight">Something went wrong on our side.</p>
        <p className="text-gray-800 dark:text-gray-300 font-extralight">Contact us if this issue persists.</p>
    </div>
}

export default function App() {
    return <Outlet />
}