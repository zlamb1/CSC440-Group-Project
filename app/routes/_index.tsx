import { Card } from "@/components/ui/card";
import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import NotImplemented from "@components/NotImplemented";
import {PostEditor, PostEditorElement, PostView} from "@components/PostEditor";
import React, {FormEvent} from "react";

export async function loader({ context }: LoaderFunctionArgs) {
    const posts = await context.db.getPublicPosts();
    return json({ user: context.user, posts });
}

export default function Index() {
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const ref = React.createRef<PostEditorElement>();
    if (!data?.user.loggedIn) {
        return <NotImplemented />
    }
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
            <div className="p-5">
                <Form navigate={false} className="flex flex-col gap-5 items-center" onSubmit={onSubmit}>
                    <span className="text-xl font-bold select-none">Create a Post</span>
                    <PostEditor ref={ref} containerProps={{ className: 'w-full border px-1' }} />
                    <Button type="submit">Upload Post</Button>
                </Form>
            </div>
            {
                data?.posts.map((post: any) => {
                    return (
                        <div className="p-3 flex flex-col gap-3 select-none w-full" key={post.id}>
                            <div className="flex gap-3">
                                <span className="font-bold">{post.userName}</span>
                            </div>
                            <PostView content={post.content} />
                            {
                                post.poster === data.user.id ?
                                    (<Form className="flex p-0" navigate={false} action="/delete-post" method="post">
                                        <input name="id" className="hidden" readOnly value={post.id} />
                                        <Button className="bg-red-600 hover:bg-red-500">Delete</Button>
                                    </Form>) :
                                    null
                            }
                        </div>
                    );
                })
            }
        </div>
    )
}