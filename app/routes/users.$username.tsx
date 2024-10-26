import {json, LoaderFunctionArgs} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";

import {Separator} from "@ui/separator";
import UserAvatar from "@/components/UserAvatar";
import {Button} from "@ui/button";
import {ProfileVisibility, Post as _Post, Follow} from "@prisma/client";
import NotFound from "@/routes/$";
import Post from "@components/post/Post";
import {Fragment, useState} from "react";
import FollowButton from "@components/FollowButton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@ui/tabs";
import {LayoutGroup, motion} from "framer-motion";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.username) {
            return json({ error: 'Username is required', self: context.user });
        }

        const user = await context.prisma.user.findUnique({
            include: {
                posts: {
                    where: {
                        replyTo: null,
                    },
                    include: {
                        replies: {
                            include: {
                                user: {
                                    where: {
                                        visibility: ProfileVisibility.PUBLIC,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            where: {
                userName: params.username,
            },
        });

        if (!user) {
            return json({ error: 'User not found', self: context.user });
        }

        if (user.visibility !== ProfileVisibility.PUBLIC) {
            if (context.user.loggedIn && context.user.id === user.id) {
                return json({ user, self: context.user });
            } else {
                return json({ error: 'User not found', self: context.user });
            }
        }

        return json({ user, self: context.user });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error', self: context.user });
    }
}

function getFormattedDate(joinedAt: Date) {
    if (!joinedAt) {
        return null;
    } else {
        joinedAt = new Date(joinedAt);
    }

    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August",
        "September", "October", "November", "December"
    ]

    return (
        months[joinedAt.getMonth()] + ", " + joinedAt.getFullYear()
    );
}

export default function UserRoute() {
    const data = useLoaderData<typeof loader>();
    const [tab, setTab] = useState('posts');

    if (data?.error) {
        if (data.error === 'User not found') {
            return NotFound;
        }
        // TODO: throw error boundary
    }

    const posts = data?.user?.posts;
    const isOwnPage = data?.self.id === data?.user?.id;

    function isFollowing() {
        return data?.self.following.some((follow: Follow) => follow.followingId === data?.user?.id);
    }

    const tabs = [
        {
            value: 'posts',
            name: 'Posts',
        },
        {
            value: 'following',
            name: 'Following',
        },
        {
            value: 'followers',
            name: 'Followers',
        },
        {
            value: 'liked',
            name: 'Liked Posts',
        }
    ];

    return (
        <div className="flex-grow flex flex-col gap-3 m-4 ">
            <div className="flex gap-3 select-none items-center m-4">
                <UserAvatar className="text-6xl mx-12 " avatar={data?.user?.avatarPath} userName={data?.user?.userName} size={100} />
                <div className="flex flex-col mr-8">
                    {
                        data?.user?.displayName ?
                            <>
                                <span className="font-bold text-3xl">{data?.user?.displayName}</span>
                                <span className="font-bold text-base text-gray-400">@{data?.user?.userName}</span>
                            </> :
                            <span className="font-bold text-3xl">@{data?.user?.userName}</span>
                    }
                    <span className="text-sm mt-2">{"Joined " + getFormattedDate(data?.user?.joinedAt)}</span>
                    {
                        data?.user?.bio == null ?
                            <span className="text-sm mt-2">This user has not yet set a bio.</span> :
                            <span className="text-sm mt-2">{data?.user?.bio}</span>
                    }
                </div>
                {
                    isOwnPage ?
                        <Button containerClass="w-fit" variant="edit">
                            Edit Profile
                        </Button> : <FollowButton user={data?.user} isFollowing={isFollowing()} />
                }
            </div>
            <Tabs value={tab} className="flex flex-col gap-2" onValueChange={setTab}>
                <LayoutGroup id="tabs">
                    <TabsList className="flex justify-center bg-transparent">
                        {
                            tabs.map(_tab => (
                                <TabsTrigger className="flex flex-col" key={_tab.value} value={_tab.value}>
                                    {_tab.name}
                                    { _tab.value === tab ? <motion.div className="border w-full border-current" layoutId="tab" /> : null }
                                </TabsTrigger>
                            ))
                        }
                    </TabsList>
                </LayoutGroup>
                <Separator />
                <TabsContent className="flex flex-col gap-2" value="posts">
                    {
                        posts?.map((post: _Post) =>
                            <Fragment key={post.id}>
                                <Post post={{...post, user: data?.user}} viewer={data?.self}/>
                                <Separator/>
                            </Fragment>
                        )
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}

