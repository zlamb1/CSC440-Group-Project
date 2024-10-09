import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList, NavigationMenuTrigger,
} from "@ui/navigation-menu";
import {Link, useFetcher} from "@remix-run/react";
import {LogIn, LogOut, MessageCircleCode, PersonStanding, Settings, TrashIcon, UserRound} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";
import {HamburgerMenuIcon} from "@radix-ui/react-icons";
import React from "react";
import UserAvatar from "@components/UserAvatar";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Separator} from "@ui/separator";

export interface NavBarProps {
    ssrColorScheme?: string;
    user?: any;
}

export default function NavBar({ ssrColorScheme, user }: NavBarProps) {
    const logoutFetcher = useFetcher();
    const [ isOpen, setOpen ] = React.useState(false);
    const links = [
        { text: 'Link 1', to: '/test1' },
        { text: 'Link 2', to: '/test2' },
        { text: 'Link 3', to: '/test3' },
    ];
    return (
        <NavigationMenu className="bg-background py-2 w-100 text-lg h-fit px-4 sm:px-16 md:px-32 lg:px-64 xl:px-96">
            <NavigationMenuList className="flex flex-row items-baseline gap-5">
                <NavigationMenuItem className="md:hidden">
                    <NavigationMenuTrigger>
                        <HamburgerMenuIcon />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="flex flex-col flex-nowrap w-[175px]">
                            {
                                links.map(link =>
                                    <Button className="w-full" variant="ghost" key={link.to}>
                                        <Link to={link.to}>
                                            {link.text}
                                        </Link>
                                    </Button>
                                )
                            }
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link className="flex flex-row items-baseline font-bold gap-1" to="/">
                        <MessageCircleCode className="w-5 h-5 self-center" />
                        Stories
                    </Link>
                </NavigationMenuItem>
                {links.map(link =>
                        <NavigationMenuItem key={link.to} className="hidden text-sm md:block">
                            <Link to={link.to}>
                                {link.text}
                            </Link>
                        </NavigationMenuItem>
                    )
                }
            </NavigationMenuList>
            <NavigationMenuList className="flex flex-row items-center gap-1">
                <NavigationMenuItem className="flex items-center">
                    <ThemeSwitch ssrColorScheme={ssrColorScheme} />
                </NavigationMenuItem>
                <NavigationMenuItem className="flex items-center">
                    {
                        user?.loggedIn ?
                            <DropdownMenu open={isOpen} onOpenChange={(isOpen) => setOpen(isOpen)} modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <UserAvatar userName={user?.userName} />
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
                                    <logoutFetcher.Form method="POST" action="/logout">
                                        <Button containerClass="flex"
                                                className="flex-grow flex gap-4 text-red-700 dark:text-red-500 hover:text-red-700 dark:hover:text-red-500"
                                                disabled={logoutFetcher.state !== 'idle'}
                                                variant="ghost">
                                            {
                                                logoutFetcher.state !== 'idle' ? <LoadingSpinner style={{margin: '0 auto'}} /> : (
                                                    <>
                                                        <LogOut size={20} />
                                                        <span className="flex-grow text-left">Log Out</span>
                                                    </>
                                                )
                                            }
                                        </Button>
                                    </logoutFetcher.Form>
                                </DropdownMenuContent>
                            </DropdownMenu> :
                            <Link to="/login"><Button variant="ghost" size="icon" type="submit"><LogIn /></Button></Link>
                    }
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}