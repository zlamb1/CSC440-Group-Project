import {
    Links,
    Meta,
    Outlet,
    Scripts,
} from "@remix-run/react";

import MyApp from "@components/MyApp";

import type { LinksFunction } from "@remix-run/node";
import stylesheet from "@css/tailwind.css?url";
import {StrictMode} from "react";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
];

export default function App() {
    return (
        <html>
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
                <StrictMode>
                    <div id="root" className="flex p-6">
                        <MyApp />
                    </div>
                </StrictMode>
                <Outlet/>
                <Scripts/>
            </body>
        </html>
    );
}