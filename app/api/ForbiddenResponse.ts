import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function ForbiddenResponse(message?: string | object, statusCode?: number) {
    return EndpointResponse(message ?? 'Forbidden', statusCode ?? ResponseType.Forbidden);
}

export function AlreadyExistsResponse(resource?: string) {
    return ForbiddenResponse(resource ? `${resource} Already Exists` : 'Resource Already Exists');
}