import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function ResourceNotFoundResponse(message?: string | object, statusCode?: number) {
    return EndpointResponse(message ?? 'Resource Not Found', statusCode ?? ResponseType.ResourceNotFound);
}

export function ExplicitResourceNotFoundResponse(resource: string) {
    return ResourceNotFoundResponse(`${resource} Not Found`);
}