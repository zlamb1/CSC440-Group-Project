import { Card } from "@/components/ui/card";
import {Form, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import NotImplemented from "@components/NotImplemented";
import {Textarea} from "@ui/textarea";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const posts = await context.posts.getPosts();
    return json({ user: context.user.data, posts });
}

export default function Index() {
    const data = useLoaderData<typeof loader>();
    if (!data?.user.loggedIn) {
        return <NotImplemented />
    }
    return (
        <div className="flex flex-col gap-3 items-center mt-16">
            <Card className="w-[50%] p-5">
                <Form navigate={false} className="flex flex-col gap-5 items-center" action="/create-post" method="post">
                    <span className="font-bold select-none">Create a Post</span>
                    <Textarea placeholder="Enter your message here." name="content" required/>
                    <Button type="submit">Upload Post</Button>
                </Form>
            </Card>
            {
                data?.posts.map((post: any) => {
                    return (
                        <Card className="p-3 flex flex-col gap-3 select-none" key={post.id}>
                            <span>Posted by {post.user_name}</span>
                            <span>Posted at {post.posted_at}</span>
                            <span>Post content: {post.content}</span>
                            {
                                post.poster_id === data.user.id ?
                                    (<Form navigate={false} action="/delete-post" method="post"><input name="id" className="invisible" readOnly value={post.id} /><Button className="bg-red-600 hover:bg-red-500">Delete</Button></Form>) :
                                    null
                            }
                        </Card>
                    );
                })
            }
        </div>
    )
}