import {LoaderFunctionArgs} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import EndpointResponse from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function getPublicUserByID({id, context}: { id: string; context: any }) {
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
      id,
    },
  });
}

export async function loader({context, params}: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      return RequiredFieldResponse('Username');
    }

    const user = await getPublicUserByID({id: params.id, context});

    if (!user) {
      return ExplicitResourceNotFoundResponse('User');
    }

    return EndpointResponse({user});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}