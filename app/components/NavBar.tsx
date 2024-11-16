import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList, NavigationMenuTrigger,
} from "@ui/navigation-menu";
import {Link} from "@remix-run/react";
import {Bell, LogIn, MessageCircleCode, Search} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";
import React, {forwardRef, RefObject} from "react";
import UserNavDropdown from "@components/dropdown/UserNavDropdown";
import Fade from "@ui/fade";
import NotificationNavDropdown from "@components/dropdown/NotificationNavDropdown";
import {Input} from "@ui/input";
import UserSearch from "@components/user/UserSearch";

export interface NavBarProps {
    ssrColorScheme?: string;
    className?: string;
    user?: any;
    notificationCount: number;
}

const NavBar = forwardRef<HTMLDivElement, NavBarProps>(({ ssrColorScheme, className, user, notificationCount }, ref) => {
    return (
        <NavigationMenu className={className} ref={ref}>
            <NavigationMenuList className="flex flex-row items-baseline gap-5">
                <NavigationMenuItem>
                    <Link className="flex flex-row items-baseline font-bold gap-1" to="/">
                        <MessageCircleCode className="w-5 h-5 self-center" />
                        Stories
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList className="flex flex-row items-center gap-1">
                <NavigationMenuItem className="hidden md:flex">
                    <UserSearch user={user} />
                </NavigationMenuItem>
                <NavigationMenuItem className="flex items-center">
                    <ThemeSwitch ssrColorScheme={ssrColorScheme} />
                </NavigationMenuItem>
                <Fade id="notifications-dropdown"
                      show={user?.loggedIn}
                      container={<NavigationMenuItem className="flex items-center" />}
                >
                    <Link to="/inbox">
                        <Button className="relative" size="icon" variant="ghost">
                            <Bell size={20} />
                            {
                                notificationCount > 0 ?
                                    <div
                                        className="bg-primary text-white rounded-full absolute w-[12px] h-[12px] flex justify-center items-center text-[10px] right-[5px] bottom-[5px]">
                                        {notificationCount}
                                    </div> : null
                            }
                        </Button>
                    </Link>
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
});

export default NavBar;