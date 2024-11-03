import {
    Links,
    Meta,
    Scripts, useLocation, useOutlet, useRouteError, useRouteLoaderData,
} from "@remix-run/react";

import NavBar from "@components/NavBar";

import {json, LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import twStylesheet from "@css/tailwind.css?url";
import tiptapStylesheet from "@css/tiptap.css?url";
import animationStylesheet from "@css/animation.css?url";
import React from "react";
import ThemeScript from "@/utils/theme-script";
import {AnimatePresence, motion} from "framer-motion";
import {colorSchemeStorageName, cookiePreferenceStorageName, defaultColorScheme} from "@/utils/prefers-color-scheme";
import FollowingPanel from "@components/FollowingPanel";
import CookieToast from "@components/toast/CookieToast";
import * as Toast from "@radix-ui/react-toast";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: twStylesheet },
    { rel: "stylesheet", href: tiptapStylesheet },
    { rel: "stylesheet", href: animationStylesheet },
];

function parseCookie(cookieHeader: any, cookieName: string) {
    const cookies = cookieHeader?.replaceAll(' ', '').split(";");
    if (cookies) {
        for (const cookie of cookies) {
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.split('=')[1];
            }
        }
    }
    return null;
}

export async function loader({context, request}: LoaderFunctionArgs) {
    const header = request.headers.get('Cookie');
    const cookiePreference = parseCookie(header, cookiePreferenceStorageName);
    const ssrColorScheme = cookiePreference === 'accept' ? parseCookie(header, colorSchemeStorageName) : defaultColorScheme;
    return json({ ssrColorScheme, cookiePreference, user: context.user });
}

export function Layout({children}: {children: React.ReactNode}) {
    const data = useRouteError() ? null : useRouteLoaderData("root");
    const user = data?.user;
    
    return (
        <html lang="en" suppressHydrationWarning>
        <Toast.Provider>
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
                <CookieToast initial={data?.cookiePreference}/>
                <div className="flex flex-col bg-background min-h-[100vh]">
                    <NavBar {...data} className="py-2 w-100 text-lg h-fit px-4 sm:px-16 md:px-32 lg:px-64 xl:px-96"/>
                    <div className="flex-grow flex gap-3 w-full p-3">
                        <FollowingPanel className="hidden md:flex lg:w-[15%] xl:w-[20%] flex-shrink-0" user={user}/>
                        <div className="border-0 bg-background flex-grow flex justify-center">
                            {children}
                        </div>
                        <div className="lg:w-[15%] xl:w-[20%] flex-shrink-0"></div>
                    </div>
                </div>
                <Scripts />
                <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-[10px] m-1" style={{ zIndex: 2147483647 }} />
            </body>
        </Toast.Provider>
        </html>
    )
}

export function ErrorBoundary() {
    console.error(useRouteError());
    return (
        <div
            className="mx-8 sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 select-none flex-grow flex flex-col items-center mt-32 gap-1">
            <p className="text-5xl font-bold">Oops!</p>
            <p className="text-gray-800 dark:text-gray-300 font-extralight">Something went wrong on our side.</p>
            <p className="text-gray-800 dark:text-gray-300 font-extralight">Contact us if this issue persists.</p>
        </div>
    )
}

export default function App() {
    const outlet = useOutlet();
    const {pathname} = useLocation();
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.main key={pathname}
                         className="w-full flex justify-center"
                         initial={{opacity: 0}}
                         animate={{opacity: 1}}
                         exit={{opacity: 0}}
                         transition={{duration: 0.1}}>
                {outlet}
            </motion.main>
        </AnimatePresence>
    );
}