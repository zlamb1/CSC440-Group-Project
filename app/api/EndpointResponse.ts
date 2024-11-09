import {json} from "@remix-run/node";

export const ResponseType = {
    Success: 200,
    Created: 201,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    ResourceNotFound: 404,
    Unknown: 500,
}

export default function EndpointResponse(message: string | object, statusCode?: number) {
    if (typeof message === "string") {
        return json({ error: message }, { status: statusCode ?? ResponseType.Success })
    } else {
        return json(message, { status: statusCode ?? ResponseType.Success });
    }
}