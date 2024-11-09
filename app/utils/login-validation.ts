import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

export async function validateUsername(context: any, userName: string) {
    if (!userName) {
        return EndpointResponse({ username: 'Username is required.' }, ResponseType.BadRequest);
    }

    const length = userName?.length;
    if (length < 4 || length > 20) {
        return EndpointResponse({ username: 'Username must be between four and twenty characters long.' }, ResponseType.BadRequest);
    }

    const user = await context.prisma.user.findUnique({
        where: {
            userName
        },
    });

    if (user) {
        return EndpointResponse({ username: 'Username is unavailable' }, ResponseType.Forbidden);
    }
}

export async function validatePassword(passWord: string, strict?: boolean) {
    if (!passWord) {
        return EndpointResponse({ password: 'Password is required.' }, ResponseType.BadRequest);
    }

    if (passWord.length < 8 || passWord.length > 50) {
        return EndpointResponse({ password: 'Password must be between eighty and fifty characters' }, ResponseType.BadRequest);
    }

    if (strict) {
        if (!passWord.match('[A-Z]+')) {
            return EndpointResponse({ password: 'Password must contain at least one uppercase letter.' }, ResponseType.BadRequest);
        }
        if (!passWord.match('[0-9]+')) {
            return EndpointResponse({ password: 'Password must contain at least one digit.' }, ResponseType.BadRequest);
        }
    }
}