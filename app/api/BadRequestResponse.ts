import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export default function BadRequestResponse(message?: string | object, statusCode?: number) {
    return EndpointResponse(message ?? 'Bad Request', statusCode ?? ResponseType.BadRequest);
}

export function RequiredFieldResponse(field: string, useFieldAsProperty?: boolean) {
    if (useFieldAsProperty) {
        return BadRequestResponse({ [field]: `${field} Is Required` });
    }

    return BadRequestResponse(`${field} Is Required`);
}