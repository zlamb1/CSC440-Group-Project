import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function UnauthorizedResponse(message?: string | object, statusCode?: number) {
    return EndpointResponse(message ?? 'Unauthorized', statusCode ?? ResponseType.Unauthorized);
}