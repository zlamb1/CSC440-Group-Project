import {ActionFunctionArgs, redirect} from "@remix-run/node";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

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

export async function validatePassword(passWord: string) {
    if (!passWord) {
        return EndpointResponse({ password: 'Password is required.' }, ResponseType.BadRequest);
    }

    if (passWord.length < 8 || passWord.length > 50) {
        return EndpointResponse({ password: 'Password must be between eighty and fifty characters' }, ResponseType.BadRequest);
    }
}

export async function action({ context, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const userName = String(formData.get("username"));
        const passWord = String(formData.get("password"));

        const userNameValidation = await validateUsername(context, userName);
        if (userNameValidation) {
            return userNameValidation;
        }

        const passWordValidation = await validatePassword(passWord);
        if (passWordValidation) {
            return passWordValidation;
        }

        const session = await context.session.getSession();
        const passwordHash = await context.bcrypt.hash(passWord);
        const user = await context.prisma.user.create({
            data: {
                userName, passwordHash
            },
        });

        session.set(context.cookieProperty.userID, user.id);

        return redirect('/', {
            headers: {
                'Set-Cookie': await context.session.commitSession(session),
            }
        });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}