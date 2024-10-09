import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {PostEditor, PostEditorElement} from "@components/PostEditor";
import React, {FormEvent} from "react";
import Post from "@components/Post";
import {Separator} from "@ui/separator";
import UserAvatar from "@components/UserAvatar";

export async function loader({ context }: LoaderFunctionArgs) {
    const posts = await context.db.getPublicPosts();
    return json({ user: context.user, posts });
}

export default function Index() {
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const ref = React.createRef<PostEditorElement>();
    function onSubmit(evt: FormEvent<HTMLFormElement>) {
        evt.preventDefault();
        if (ref.current) {
            const formData = new FormData();
            formData.set('content', ref.current?.getContent());
            fetcher.submit(formData, {
                method: 'POST',
                action: '/create-post',
            });
        }
    }
    return (
        <div className="flex flex-col gap-3 w-full">
            {
                data?.user.loggedIn ? (
                    <div className="p-5">
                        <Form navigate={false} className="flex flex-col flex-wrap gap-3 items-center" onSubmit={onSubmit}>
                            <div className="flex self-start gap-3 flex-shrink-0">
                                <UserAvatar userName={data?.user.userName} className="flex-shrink-0 mt-[2px]" />
                                <PostEditor ref={ref} editorProps={{ attributes: { class: 'focus-visible:outline-none' } }} containerProps={{className: 'break-all w-full text-lg'}}/>
                            </div>
                            <Button className="font-bold" containerClass="self-end" type="submit">Post</Button>
                        </Form>
                    </div>
                ) : null
            }
            <div className="mx-1">
                {
                    data?.posts.map((post: any, i: number) => {
                        return (
                            <React.Fragment key={post.id}>
                                <Separator />
                                <Post className="p-3" post={post} user={data?.user} />
                                {
                                    i === data.posts.length - 1 ? <Separator /> : null
                                }
                            </React.Fragment>
                        );
                    })
                }
            </div>
        </div>
    )
}