import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList, NavigationMenuTrigger,
} from "@ui/navigation-menu";
import {Form, Link} from "@remix-run/react";
import {LogIn, LogOut, MessageCircleCode} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";
import {HamburgerMenuIcon} from "@radix-ui/react-icons";
import React from "react";

export interface NavBarProps {
    ssrColorScheme?: string;
    user?: any;
}

export default function NavBar({ ssrColorScheme, user }: NavBarProps) {
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
                            {links.map(link => <Button className="w-full" variant="ghost" key={link.to}>
                                <Link to={link.to}>
                                    {link.text}
                                </Link></Button>)
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
                {links.map(link => <NavigationMenuItem key={link.to} className="hidden text-sm md:block">
                    <Link to={link.to}>
                        {link.text}
                    </Link>
                </NavigationMenuItem>) }
            </NavigationMenuList>
            <NavigationMenuList className="flex flex-row items-center gap-1">
                <NavigationMenuItem className="flex items-center">
                    <ThemeSwitch ssrColorScheme={ssrColorScheme} />
                </NavigationMenuItem>
                <NavigationMenuItem className="flex items-center">
                    {
                        user?.loggedIn ? (<Form action="/logout" method="post"><Button variant="ghost" size="icon"><LogOut /></Button></Form>) :
                            (<Link to="/login"><Button variant="ghost" size="icon" type="submit"><LogIn /></Button></Link>)
                    }
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}