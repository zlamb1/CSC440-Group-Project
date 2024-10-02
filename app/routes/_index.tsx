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
        <div className="flex justify-center">
            <div className="flex flex-col gap-3 mt-16 w-[90%] md:w-[75%] xl:w-[50%]">
                <Card className="p-5">
                    <Form navigate={false} className="flex flex-col gap-5 items-center" action="/create-post" method="post">
                        <span className="text-xl font-bold select-none">Create a Post</span>
                        <Textarea placeholder="Enter your message here." name="content" required/>
                        <Button type="submit">Upload Post</Button>
                    </Form>
                </Card>
                {
                    data?.posts.map((post: any) => {
                        return (
                            <Card className="p-3 flex flex-col gap-3 select-none w-full" key={post.id}>
                                <span>Posted by {post.user_name}</span>
                                <span>Posted at {post.posted_at}</span>
                                <span>Post content: {post.content}</span>
                                {
                                    post.poster_id === data.user.id ?
                                        (<Form className="p-0" navigate={false} action="/delete-post" method="post"><input name="id" className="hidden" readOnly value={post.id} /><Button className="bg-red-600 hover:bg-red-500">Delete</Button></Form>) :
                                        null
                                }
                            </Card>
                        );
                    })
                }
            </div>
        </div>
    )
}