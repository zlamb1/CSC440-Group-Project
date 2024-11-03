import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function UpdateResponse(message?: Object, statusCode?: number) {
    return EndpointResponse(message ?? { success: 'Updated Resource' }, statusCode ?? ResponseType.Success);
}

export function ExplicitUpdateResponse(resource: string) {
    return UpdateResponse({ success: `Updated ${resource}` });
}