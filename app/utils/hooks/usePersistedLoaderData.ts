import {useEffect, useRef} from "react";
import {useLoaderData} from "@remix-run/react";
import {loader} from "@/routes/users.$username";

export default function usePersistedLoaderData() {
    const lastData = useRef();
    const data = useLoaderData<typeof loader>() || lastData.current;

    useEffect(() => {
        if (data) {
            lastData.current = data;
        }
    }, [data]);

    return { data };
}