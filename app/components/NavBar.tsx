import {NavigationMenu, NavigationMenuItem, NavigationMenuList,} from "@ui/navigation-menu";
import {Link, useFetcher} from "@remix-run/react";
import {Bell, LogIn, MessageCircleCode} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";
import React, {forwardRef, useContext, useEffect, useState} from "react";
import UserNavDropdown from "@components/dropdown/UserNavDropdown";
import Fade from "@ui/fade";
import UserSearch from "@components/user/UserSearch";
import {UserContext} from "@/utils/context/UserContext";

export interface NavBarProps {
  ssrColorScheme?: string;
  className?: string;
  user?: any;
}

function InboxButton() {
  const fetcher = useFetcher();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    fetcher.submit(null, {
      action: '/notifications/unread/count',
      method: 'GET',
    });
  }, []);

  useEffect(() => {
    setUnread(fetcher?.data?.unread);
  }, [fetcher.data]);

  return (
    <Link to="/inbox">
      <Button className="relative" size="icon" variant="ghost">
        <Bell size={20}/>
        <Fade show={fetcher.state === 'idle' && unread > 0}>
          <div
            className="bg-primary text-white rounded-full absolute w-[12px] h-[12px] flex justify-center items-center text-[10px] right-[5px] bottom-[5px]">
            {unread}
          </div>
        </Fade>
      </Button>
    </Link>
  );
}

const NavBar = forwardRef<HTMLDivElement, NavBarProps>(({ssrColorScheme, className}, ref) => {
  const user = useContext(UserContext);

  return (
    <NavigationMenu className={className} ref={ref}>
      <NavigationMenuList className="flex flex-row items-baseline gap-5">
        <NavigationMenuItem>
          <Link className="flex flex-row items-baseline font-bold gap-1" to="/">
            <MessageCircleCode className="w-5 h-5 self-center"/>
            Stories
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuList className="flex flex-row items-center gap-1">
        <NavigationMenuItem className="hidden md:flex">
          <UserSearch/>
        </NavigationMenuItem>
        <NavigationMenuItem className="flex items-center">
          <ThemeSwitch ssrColorScheme={ssrColorScheme}/>
        </NavigationMenuItem>
        <Fade id="notifications-dropdown"
              show={user?.loggedIn}
              container={<NavigationMenuItem className="flex items-center"/>}
        >
          <InboxButton/>
        </Fade>
        <Fade id="user-dropdown"
              show={user?.loggedIn}
              container={<NavigationMenuItem className="flex items-center"/>}
              fallback={
                <Link to="/login">
                  <Button variant="ghost" size="icon" type="submit">
                    <LogIn/>
                  </Button>
                </Link>
              }
        >
          <UserNavDropdown/>
        </Fade>
      </NavigationMenuList>
    </NavigationMenu>
  );
});

export default NavBar;