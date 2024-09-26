import React from "react";

export default function NotFound() {
    return <div className="mx-8 sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 select-none flex-grow flex flex-col items-center mt-32 gap-2">
        <p className="text-5xl font-bold">404 :(</p>
        <p className="text-gray-800 dark:text-gray-300 font-light">Sorry we couldn't find that page.</p>
    </div>
}