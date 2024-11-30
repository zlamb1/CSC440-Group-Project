import {LoaderFunctionArgs} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import EndpointResponse from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function getPublicUser({userName, context}: { userName: string; context: any }) {
  const stdProps = {
    id: true,
    userName: true,
    joinedAt: true,
    avatarPath: true,
    role: true,
    visibility: true,
    displayName: true,
  }

  return await context.prisma.user.findUnique({
    select: {
      ...stdProps,
    },
    where: {
      userName,
    },
  });
}

/**
 * Get public information about a user.
 */

export async function loader({context, params}: LoaderFunctionArgs) {
  try {
    if (!params.username) {
      return RequiredFieldResponse('Username');
    }

    const user = await getPublicUser({userName: params.username, context});

    if (!user) {
      return ExplicitResourceNotFoundResponse('User');
    }

    return EndpointResponse({user});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}