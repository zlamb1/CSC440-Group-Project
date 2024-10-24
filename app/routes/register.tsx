import {ActionFunctionArgs, json, redirect} from "@remix-run/node";

export async function loader() {
    return json({});
}

export async function action({ context, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const userName = String(formData.get("username"));
        const passWord = String(formData.get("password"));

        if (!userName) {
            return json({ username: 'Username is required' });
        }

        if (userName.length < 4 || userName.length > 25) {
            return json({ username: 'Username must be between four and twenty-five characters' })
        }

        if (!passWord) {
            return json({ password: 'Password is required' });
        }

        if (passWord.length < 6 || passWord.length > 50) {
            return json({ password: 'Password must be between six and fifty characters' })
        }

        const search = await context.prisma.user.findUnique({
            where: {
                userName
            },
        });

        if (search) {
            return json({ username: 'Username is unavailable' });
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
        console.error(err);
        return json({
            error: 'Unknown error'
        });
    }
}