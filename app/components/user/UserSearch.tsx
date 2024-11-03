import {Input} from "@ui/input";
import React, {useEffect, useState} from "react";
import {Link, useFetcher} from "@remix-run/react";
import {LockKeyhole, Search, X} from "lucide-react";
import {User} from "@prisma/client";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Button} from "@ui/button";
import UserAvatar from "@components/user/UserAvatar";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {UserWithLoggedIn} from "@/utils/types";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@ui/tooltip";
import FollowButton from "@components/FollowButton";

export default function UserSearch({ user }: { user: UserWithLoggedIn }) {
    const [ term, setTerm ] = useState('');
    const [ users, setUsers ] = useState([]);
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === 'idle') {
            setUsers(fetcher.data?.users);
        }
    }, [fetcher]);

    useEffect(() => {
        if (term) {
            fetcher.submit(null, {
                method: 'GET',
                action: `/users/search/${term}`
            });
        } else {
            setUsers([]);
        }
    }, [term]);

    function append() {
        if (term) {
            return (
                <Button className="rounded-full flex-shrink-0 w-6 h-6" size="icon" variant="ghost" onClick={() => setTerm('')}>
                    <X size={18} className="text-gray-500" />
                </Button>
            )
        }
    }

    function isPrivate(user: User, following?: boolean) {
        return user.visibility !== 'PUBLIC' && !following;
    }

    function isFollowing(id: string) {
        return user?.following?.some(follow => follow.followingId === id);
    }

    function onFollow(evt: React.MouseEvent<HTMLButtonElement>) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Input prepend={<Search size={18} className="flex-shrink-0 text-gray-500" />}
                       append={append()}
                       className="w-[200px]"
                       inputClasses="min-w-0"
                       placeholder="Search Users..."
                       value={term}
                       type="text"
                       onChange={(e) => setTerm(e.target.value)}
                />
            </PopoverTrigger>
            <PopoverContent className={cn("p-0 mt-2 min-w-[200px] flex flex-col justify-center items-center overflow-hidden", fetcher.state === 'idle' && !term ? 'hidden' : '')}
                            onOpenAutoFocus={(e) => e.preventDefault()}>
                {
                    fetcher.state === 'idle' ?
                        (
                            !users || !users.length ? <span className="select-none font-bold text-sm">No Users Found</span> :
                            users?.map((user: User) => {
                                const following = isFollowing(user.id);
                                const isDisabled = isPrivate(user, following);
                                return (
                                    <Link className={
                                          cn("w-full flex justify-between items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground",
                                              isDisabled && "cursor-not-allowed")
                                          }
                                          to={`/users/${user.userName}`}
                                          key={user.userName}
                                          onClick={isDisabled ? (evt) => evt.preventDefault() : undefined}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex gap-2 items-center">
                                                        <UserAvatar avatar={user.avatarPath} userName={user.userName} />
                                                        {user.userName}
                                                        { isDisabled && <LockKeyhole size={14} /> }
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className={ !isDisabled ? 'hidden' : '' }>
                                                    { isDisabled && 'User is private. Request to follow.' }
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <FollowButton user={user} isFollowing={following} onClick={ evt => evt.preventDefault() } />
                                    </Link>
                                )
                            }
                        )) : <LoadingSpinner />
                }
            </PopoverContent>
        </Popover>
    )
}