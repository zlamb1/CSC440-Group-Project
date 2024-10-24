import {json, LoaderFunctionArgs} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";

import {Separator} from "@ui/separator";
import UserAvatar from "@/components/UserAvatar";
import {Button} from "@ui/button";
import {ProfileVisibility} from "@prisma/client";
import NotFound from "@/routes/$";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.username) {
            return json({ error: 'Username is required', self: context.user });
        }

        const user = await context.prisma.user.findUnique({
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

function getJoinedStr(joinedAt: Date) {
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

function isFollowed() {
    // DOES NOTHING FOR THE TIME BEING
    return false;
}

function followUnfollow() {
    // DOES NOTHING FOR THE TIME BEING
}

export default function UserRoute() {
    const data = useLoaderData<typeof loader>();

    if (data?.error) {
        if (data.error === 'User not found') {
            return NotFound;
        }
        // TODO: throw error boundary
    }

    function isOwnPage() {
        return data?.self.id === data?.user?.id;
    }

    return (
        <div className="flex-grow flex flex-col gap-3 m-4 ">
            <div className="flex gap-3 select-none items-center m-4">
                <UserAvatar className="text-6xl mx-12 " avatar={data?.user?.avatarPath} userName={data?.user?.userName} size={100}/>

                <div className="flex flex-col mr-8">
                    {
                        data?.user?.displayName ?
                            <>
                                <span className="font-bold text-3xl">{data?.user?.displayName}</span>
                                <span className="font-bold text-base text-gray-400">@{data?.user?.userName}</span>
                            </> :
                            <span className="font-bold text-3xl">@{data?.user?.userName}</span>
                    }
                    <span className="text-sm mt-2">{"Joined " + getJoinedStr(data?.user?.joinedAt)}</span>
                    {
                        data?.user?.bio == null ?
                            <span className="text-sm mt-2">This user has not yet set a bio.</span> :
                            <span className="text-sm mt-2">{data?.user?.bio}</span>
                    }
                </div>
                {
                    isOwnPage() ?
                        <Button containerClass="w-fit" variant="edit">
                            Edit Profile
                        </Button> :
                        <Button containerClass="w-fit" variant="default">
                            {
                                isFollowed() ? "Unfollow" : "Follow"
                            }
                        </Button>
                }
            </div>
            <Separator />

        </div>
    );
}

