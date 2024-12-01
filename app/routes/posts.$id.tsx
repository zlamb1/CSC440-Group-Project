import {LoaderFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse from "@/api/EndpointResponse";
import usePersistedLoaderData from "@/utils/hooks/usePersistedLoaderData";
import NotFound from "@/routes/$";
import Post from "@components/post/Post";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {useEffect, useRef} from "react";
import {useParams} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {getPostByID} from '@prisma/client/sql';
import {isUserPrivate} from "@/routes/users.$id.posts";
import UnauthorizedResponse from "@/api/UnauthorizedError";

export async function loader({context, params}: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      return RequiredFieldResponse('Post ID');
    }

    const post = await context.prisma.$queryRawTyped(getPostByID(params.id, context.user.id));

    if (!post) {
      return ExplicitResourceNotFoundResponse('Post');
    }

    const user = await context.prisma.user.findUnique({
      include: {
        followers: true,
      },
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return ExplicitResourceNotFoundResponse('Post');
    }

    if (!post.replyTo && isUserPrivate(user, context.user)) {
      return UnauthorizedResponse();
    }

    return EndpointResponse({post});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

export default function PostRoute() {
  const data = usePersistedLoaderData();
  const isAdded = useRef<boolean>(false);
  const params = useParams();

  if (!params.id || !data?.post) {
    return NotFound;
  }

  const {add, post} = usePostStore(useShallow((state: any) => ({add: state.add, post: state[params.id || '']})));

  useEffect(() => {
    add(data.post);
    isAdded.current = true;
  }, []);

  if (!isAdded.current && !post) {
    return (
      <div className="w-full flex justify-center">
        <LoadingSpinner/>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Post id={params.id}/>
    </div>
  );
}