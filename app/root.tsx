import {
    Links,
    Meta,
    Scripts, useLoaderData, useLocation, useOutlet, useRouteError,
} from "@remix-run/react";

import NavBar from "@components/NavBar";

import {json, LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import twStylesheet from "@css/tailwind.css?url";
import tiptapStylesheet from "@css/tiptap.css?url";
import React from "react";
import ThemeScript from "@/utils/theme-script";
import {AnimatePresence, motion} from "framer-motion";
import {colorSchemeStorageName} from "@/utils/prefers-color-scheme";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: twStylesheet },
    { rel: "stylesheet", href: tiptapStylesheet },
];

function parseColorSchemeCookie(cookieHeader: any) {
    const cookies = cookieHeader?.replaceAll(' ', '').split(";");
    if (cookies) {
        for (const cookie of cookies) {
            if (cookie.indexOf(colorSchemeStorageName) === 0) {
                return cookie.split('=')[1];
            }
        }
    }
    return null;
}

export async function loader({context, request}: LoaderFunctionArgs) {
    const ssrColorScheme = parseColorSchemeCookie(request.headers.get("Cookie"));
    return json({ ssrColorScheme, user: context.user });
}

export function Layout({children}: {children: React.ReactNode}) {
    const data = useLoaderData<typeof loader>();
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
                    <NavBar {...data} />
                    {children}
                </div>
                <Scripts/>
            </body>
        </html>
    )
}

export function ErrorBoundary() {
    console.error(useRouteError());
    return (
        <div className="mx-8 sm:mx-16 md:mx- 32 lg:mx-48 xl:mx-64 select-none flex-grow flex flex-col items-center mt-32 gap-1">
            <p className="text-5xl font-bold">Oops!</p>
            <p className="text-gray-800 dark:text-gray-300 font-extralight">Something went wrong on our side.</p>
            <p className="text-gray-800 dark:text-gray-300 font-extralight">Contact us if this issue persists.</p>
        </div>
    )
}

export default function App() {
    const outlet = useOutlet();
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.main key={useLocation().pathname}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         transition={{ duration: 0.1 }}>
                {outlet}
            </motion.main>
        </AnimatePresence>
    );
}