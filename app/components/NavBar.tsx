import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList, NavigationMenuTrigger,
} from "@ui/navigation-menu";
import {Link} from "@remix-run/react";
import {Bell, LogIn, MessageCircleCode} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";
import React from "react";
import UserNavDropdown from "@components/dropdown/UserNavDropdown";
import Fade from "@ui/fade";
import NotificationNavDropdown from "@components/dropdown/NotificationNavDropdown";

export interface NavBarProps {
    ssrColorScheme?: string;
    className?: string;
    user?: any;
    notificationCount: number;
}

export default function NavBar({ ssrColorScheme, className, user, notificationCount }: NavBarProps) {
    return (
        <NavigationMenu className={className}>
            <NavigationMenuList className="flex flex-row items-baseline gap-5">
                <NavigationMenuItem>
                    <Link className="flex flex-row items-baseline font-bold gap-1" to="/">
                        <MessageCircleCode className="w-5 h-5 self-center" />
                        Stories
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList className="flex flex-row items-center gap-1">
                <NavigationMenuItem className="flex items-center">
                    <ThemeSwitch ssrColorScheme={ssrColorScheme} />
                </NavigationMenuItem>
                <Fade id="notifications-dropdown"
                      show={user?.loggedIn}
                      container={<NavigationMenuItem className="flex items-center" />}
                >
                    <NotificationNavDropdown notificationCount={notificationCount} />
                </Fade>
                <Fade id="user-dropdown"
                      show={user?.loggedIn}
                      container={<NavigationMenuItem className="flex items-center" />}
                      fallback={
                        <Link to="/login">
                            <Button variant="ghost" size="icon" type="submit">
                                <LogIn />
                            </Button>
                        </Link>
                      }
                >
                    <UserNavDropdown user={user} />
                </Fade>
            </NavigationMenuList>
        </NavigationMenu>
    );
}