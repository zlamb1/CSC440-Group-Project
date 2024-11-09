import {json} from "@remix-run/node";
import {ResponseType} from "@/api/EndpointResponse";

export default function UnknownErrorResponse(err: any, props?: object) {
    if (err) {
        console.error(err);
    }

    return json({ error: 'Unknown Error', ...props }, { status: ResponseType.Unknown });
}