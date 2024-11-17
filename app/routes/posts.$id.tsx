import {LoaderFunctionArgs} from "@remix-run/node";
import {ProfileVisibility} from "@prisma/client";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse from "@/api/EndpointResponse";
import usePersistedLoaderData from "@/utils/hooks/usePersistedLoaderData";
import NotFound from "@/routes/$";
import Post from "@components/post/Post";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {useEffect} from "react";
import {useParams} from "@remix-run/react";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

        const post = await context.prisma.post.findUnique({
            where: {
                id: params.id,
            },
            include: {
                user: {
                    where: {
                        visibility: ProfileVisibility.PUBLIC,
                    },
                },
            },
        });

        if (!post) {
            return ExplicitResourceNotFoundResponse('Post');
        }

        return EndpointResponse({ post });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

export default function PostRoute() {
    const data = usePersistedLoaderData();
    const params = useParams();

    if (!params.id || !data?.post) {
        return NotFound;
    }

    const {add} = usePostStore(useShallow((state: any) => ({ add: state.add, post: state[params.id || ''] })));

    useEffect(() => {
        add(data.post);
    }, []);

    return (
        <Post id={params.id} />
    );
}