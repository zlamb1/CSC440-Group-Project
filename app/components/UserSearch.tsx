import {Input} from "@ui/input";
import React, {useEffect, useState} from "react";
import {Link, useFetcher} from "@remix-run/react";
import {Search, X} from "lucide-react";
import {User} from "@prisma/client";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Button} from "@ui/button";
import UserAvatar from "@components/user/UserAvatar";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";

export default function UserSearch() {
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
            <PopoverContent className={cn("p-0 mt-2 w-[200px] flex flex-col justify-center items-center overflow-hidden", fetcher.state === 'idle' && !term ? 'hidden' : '')}
                            onOpenAutoFocus={(e) => e.preventDefault()}>
                {
                    fetcher.state === 'idle' ?
                        (
                            !users || !users.length ? <span className="select-none font-bold text-sm">No Users Found</span> :
                            users?.map((user: User) =>
                                <Link className="w-full" to={`/users/${user.userName}`} key={user.userName}>
                                    <Button containerClass="w-full flex" className="flex-grow flex justify-start gap-2 rounded-none p-2" variant="ghost">
                                        <UserAvatar avatar={user.avatarPath} userName={user.userName} />
                                        {user.userName}
                                    </Button>
                                </Link>
                            )
                        ) : <LoadingSpinner />
                }
            </PopoverContent>
        </Popover>
    )
}