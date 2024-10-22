import React, {useState} from "react";
import {Link, useFetcher} from "@remix-run/react";
import {DropdownMenu} from "@radix-ui/react-dropdown-menu";
import {DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {Button} from "@ui/button";
import UserAvatar from "@components/UserAvatar";
import {LogOut, Settings, UserRound} from "lucide-react";
import {LoadingSpinner} from "@components/LoadingSpinner";

export default function UserNavDropdown({ user }: { user: any }) {
    const [ isOpen, setIsOpen ] = useState(false);
    const fetcher = useFetcher();

    return (
        <DropdownMenu open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserAvatar avatar={user?.avatarPath} userName={user?.userName} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col">
                <Button containerClass="flex" className="flex-grow flex gap-4" variant="ghost">
                    <UserRound size={20} />
                    <span className="flex-grow text-left">Profile</span>
                </Button>
                <Link to="/settings">
                    <Button containerClass="flex" className="flex-grow flex gap-4" variant="ghost">
                        <Settings size={20}/>
                        <span className="flex-grow text-left">Settings</span>
                    </Button>
                </Link>
                <DropdownMenuSeparator />
                <fetcher.Form method="POST" action="/logout">
                    <Button containerClass="flex"
                            className="flex-grow flex gap-4 text-red-700 dark:text-red-500 hover:text-red-700 dark:hover:text-red-500"
                            disabled={fetcher.state !== 'idle'}
                            variant="ghost">
                        {
                            fetcher.state !== 'idle' ? <LoadingSpinner style={{margin: '0 auto'}} /> : (
                                <>
                                    <LogOut size={20} />
                                    <span className="flex-grow text-left">Log Out</span>
                                </>
                            )
                        }
                    </Button>
                </fetcher.Form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}