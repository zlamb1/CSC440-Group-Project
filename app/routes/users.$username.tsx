import {LoaderFunctionArgs} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import {useLoaderData} from "@remix-run/react";

import {Separator} from "@ui/separator";
import UserAvatar from "@/components/UserAvatar";
import {Button} from "@ui/button";

export async function loader({ context, params }: LoaderFunctionArgs) {
    return await tryDatabaseAction(async () => {
        return context.db.getUserByUsername(params.username);
    });
}

export function getJoinedStr(joinedAt: string) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August",
                    "September", "October", "November", "December"    ]
    var month = parseInt(joinedAt.substring(5, 7)) - 1;
    return (
        //joinedAt.substring(5, 7) + "/" + joinedAt.substring(8, 10) + "/" + joinedAt.substring(0,4)
        months[month] + " " + joinedAt.substring(8, 10) + ", " + joinedAt.substring(0,4)
    );
}

export function isOwnPage() {
    // DOES NOTHING FOR THE TIME BEING
    return false;
}

export function isFollowed() {
    // DOES NOTHING FOR THE TIME BEING
    return false;
}

export function followUnfollow() {
    // DOES NOTHING FOR THE TIME BEING
}

export default function UserRoute() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="flex-grow flex flex-col gap-3 m-4 ">
            <div className="flex gap-3 select-none items-center m-4">
                <UserAvatar className="text-6xl mx-12 " avatar={data.avatarPath} userName={data.userName} size={100}/>

                <div className="flex flex-col mr-8">
                    <span className="font-bold text-3xl">{data.userName}</span>
                    <span className="font-bold text-base">{data.displayName}</span>
                    <span className="text-sm mt-2">{"Joined " + getJoinedStr(data.joinedAt)}</span>
                    {
                        data.bio == null ?
                        <span className="text-sm mt-2">This user has not yet set a bio.</span> :
                        <span className="text-sm mt-2">{data.bio}</span>
                    }
                    
                </div>
                
                {
                    isOwnPage() ?
                    <Button containerClass="w-fit" variant="edit">
                        Edit Profile
                    </Button> :
                    <Button containerClass="w-fit" variant="default">
                        {
                            isFollowed()? 
                            "Unfollow" : "Follow" 
                        }
                    </Button> 
                }

            </div>
            <Separator />

        </div>
    );
}

