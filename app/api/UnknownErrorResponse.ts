import {json} from "@remix-run/node";
import {ResponseType} from "@/api/EndpointResponse";

export default function UnknownErrorResponse(err: any) {
    if (err) {
        console.error(err);
    }

    return json({ error: 'Unknown Error' }, { status: ResponseType.Unknown });
}