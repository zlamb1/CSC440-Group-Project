import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function CreateResponse(message?: Object, statusCode?: number) {
    return EndpointResponse(message ?? { success: 'Created Resource' }, statusCode ?? ResponseType.Created);
}

export function ExplicitCreateResponse(resource: string, props?: object) {
    return CreateResponse({ success: `Created ${resource}`, ...props });
}