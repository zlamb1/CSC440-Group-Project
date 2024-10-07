import {json} from "@remix-run/node";

export async function tryDatabaseAction(fn: Function) {
    try {
        return await fn();
    } catch (err) {
        // @ts-ignore
        if (err?.name == 'DBError') {
            // @ts-ignore
            return json(err?.data);
        }
        return json({ error: 'Unknown error.' });
    }
}