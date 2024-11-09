import EndpointResponse from "@/api/EndpointResponse";

export default function DeleteResponse(message?: Object, statusCode?: number) {
    return EndpointResponse(message ?? { success: 'Deleted Resource' }, statusCode ?? 200);
}

export function ExplicitDeleteResponse(resource: string, props?: any) {
    return DeleteResponse({ success: `Deleted ${resource}`, ...props });
}