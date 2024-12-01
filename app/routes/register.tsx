import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {validatePassword, validateUsername} from "@/utils/login-validation";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {PrismaClient} from "@prisma/client";

export async function action({context, request}: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const userName = String(formData.get("username"));
    const passWord = String(formData.get("password"));

    const userNameValidation = await validateUsername(context, userName);
    if (userNameValidation) {
      return userNameValidation;
    }

    const passWordValidation = await validatePassword(passWord, true);
    if (passWordValidation) {
      return passWordValidation;
    }

    const session = await context.session.getSession();
    const passwordHash = await context.bcrypt.hash(passWord);

    const user = await context.prisma.$transaction(async (tx: PrismaClient) => {
      const user = await tx.user.create({data: {userName, passwordHash}});

      if (!user) {
        throw new Error('Failed to create user.');
      }

      const notification = await tx.notification.create({
        data: {
          type: 'greeting',
          content: 'Welcome to Stories!',
          userId: user.id,
        },
      });

      if (!notification) {
        throw new Error('Failed to create notification.');
      }

      return user;
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