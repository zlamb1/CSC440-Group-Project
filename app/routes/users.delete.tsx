import NotFound from "@/routes/$";
import {ActionFunctionArgs, redirect} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {useSession} from "@/utils/hooks/useSession.server";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

export async function action({context, request}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const userName = String(formData.get('userName'));
    const passWord = String(formData.get('passWord'));

    if (userName !== context.user.userName) {
      return EndpointResponse({username: 'Username Must Match'}, ResponseType.BadRequest);
    }

    const user = await context.prisma.user.findUnique({
      where: {
        userName: context.user.userName,
      }
    });

    if (!user) {
      return ExplicitResourceNotFoundResponse('User');
    }

    if (await context.bcrypt.compare(passWord, user.passwordHash)) {
      const {session} = await useSession(context, request);
      const cookie = await context.session.destroySession(session);

      await context.prisma.user.delete({
        where: {
          userName: context.user.userName,
        }
      });

      return redirect('/', {
        headers: {
          'Set-Cookie': cookie
        }
      });
    }

    return EndpointResponse({password: 'Invalid Credentials'}, ResponseType.BadRequest);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return ExplicitResourceNotFoundResponse('User');
      }
    }

    return UnknownErrorResponse(err);
  }
}

export default NotFound;