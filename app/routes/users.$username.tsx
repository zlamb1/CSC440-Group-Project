import {json, LoaderFunctionArgs} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";

import {Separator} from "@ui/separator";
import UserAvatar from "@components/user/UserAvatar";
import {Button} from "@ui/button";
import {ProfileVisibility, Post as _Post, Follow, Prisma, User} from "@prisma/client";
import NotFound from "@/routes/$";
import Post from "@components/post/Post";
import {Fragment, useState} from "react";
import FollowButton from "@components/FollowButton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@ui/tabs";
import {LayoutGroup, motion} from "framer-motion";
import UserDisplay from "@components/user/UserDisplay";

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
                                user: true,
                            },
                        },
                    },
                },
                following: {
                    include: {
                        following: true,
                    },
                },
                followers: {
                    include: {
                        follower: true,
                    }
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
    }

    joinedAt = new Date(joinedAt);

    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August",
        "September", "October", "November", "December"
    ]

    return (
        months[joinedAt.getMonth()] + " " + joinedAt.getDate() + ", " + joinedAt.getFullYear()
    );
}

function FollowRow({ follow, user }: { follow: Follow, user: User }) {
    return (
        <Link to={`/users/${user.userName}`}>
            <Button containerClass="w-full flex" className="h-fit flex-grow flex justify-start gap-4" variant="ghost" clickAnimationScale={0.99} disableRipple>
                <UserAvatar className="text-2xl" avatar={user.avatarPath} userName={user.userName} size={50} />
                <div className="flex flex-col">
                    <UserDisplay user={user} />
                </div>
                <div className="text-gray-300">
                    Followed Since {getFormattedDate(follow.followedAt)}
                </div>
            </Button>
        </Link>
    );
}

export default function UserRoute() {
    const data = useLoaderData<typeof loader>();
    const [tab, setTab] = useState('posts');

    if (data?.error) {
        if (data.error === 'User not found') {
            return <NotFound />;
        }
    }

    const self = data?.self;
    const user = data?.user;
    const posts = user?.posts;
    const following = user?.following;
    const followers = user?.followers;

    const isOwnPage = self?.id === user?.id;

    function isFollowing() {
        return self?.following?.some((follow: Follow) => follow.followingId === user?.id);
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
                <UserAvatar className="text-6xl mx-12 " avatar={user?.avatarPath} userName={user?.userName} size={100} />
                <div className="flex flex-col mr-8">
                    {
                        user?.displayName ?
                            <>
                                <span className="font-bold text-3xl">{user?.displayName}</span>
                                <span className="font-bold text-base text-gray-400">@{user?.userName}</span>
                            </> :
                            <span className="font-bold text-3xl">@{user?.userName}</span>
                    }
                    <span className="text-sm mt-2">{"Joined " + getFormattedDate(user?.joinedAt)}</span>
                    {
                        user?.bio == null ?
                            <span className="text-sm mt-2">This user has not yet set a bio.</span> :
                            <span className="text-sm mt-2">{user?.bio}</span>
                    }
                </div>
                {
                    isOwnPage ? (
                        //this Link's classes make it match the look of a button.
                        <Link to="/settings" className="flex flex-row gap-1   w-fit   items-center justify-center whitespace-nowrap relative overflow-hidden rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-700 shadow-sm hover:bg-blue-700/90 text-white h-9 px-4 py-2">
                            Edit Profile
                        </Link>
                    ) : ( 
                        <FollowButton user={user} isFollowing={isFollowing()} /> 
                    )
                }
            </div>
            <Tabs value={tab} className="flex flex-col" onValueChange={setTab}>
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
                                <Post post={{...post, user}} viewer={self}/>
                                <Separator/>
                            </Fragment>
                        )
                    }
                </TabsContent>
                <TabsContent className="flex flex-col gap-2" value="following">
                    {
                        !following || !following.length || following.length === 0 ?
                            <div className="font-bold select-none text-center mt-8">
                                <span className="text-primary">@{user?.userName}</span> is not following anyone ¯\_(ツ)_/¯
                            </div> : null
                    }
                    {
                        following?.map((follow: Prisma.FollowGetPayload<{ include: { following: true } }>) =>
                            <FollowRow key={follow.followingId} follow={follow} user={follow.following} />
                        )
                    }
                </TabsContent>
                <TabsContent className="flex flex-col gap-2" value="followers">
                    {
                        !followers || !followers.length || followers.length === 0 ?
                            <div className="font-bold select-none text-center mt-8">
                                <span className="text-primary">@{user?.userName}</span> is not followed by anyone ¯\_(ツ)_/¯
                            </div> : null
                    }
                    {
                        followers?.map((follow: Prisma.FollowGetPayload<{ include: { follower: true } }>) =>
                            <FollowRow key={follow.followerId} follow={follow} user={follow.follower} />
                        )
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}

