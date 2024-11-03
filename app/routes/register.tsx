import {ActionFunctionArgs, json, redirect} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function loader() {
    return json({});
}

export async function action({ context, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const userName = String(formData.get("username"));
        const passWord = String(formData.get("password"));

        if (!userName) {
            return RequiredFieldResponse('Username', true);
        }

        if (userName.length < 4 || userName.length > 25) {
            return EndpointResponse({ username: 'Username must be between four and twenty-five characters' }, ResponseType.BadRequest);
        }

        if (!passWord) {
            return RequiredFieldResponse('Password', true);
        }

        if (passWord.length < 6 || passWord.length > 50) {
            return EndpointResponse({ password: 'Password must be between six and fifty characters' }, ResponseType.BadRequest);
        }

        const search = await context.prisma.user.findUnique({
            where: {
                userName
            },
        });

        if (search) {
            return EndpointResponse({ username: 'Username is unavailable' }, ResponseType.Forbidden);
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