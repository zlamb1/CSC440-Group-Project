import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@ui/navigation-menu";
import {Link} from "@remix-run/react";
import {LogIn, MessageCircleCode} from "lucide-react";
import {Button} from "@ui/button";
import ThemeSwitch from "@components/ThemeSwitch";

export default function MyApp() {
    return (
        <div className="w-100 flex flex-row" style={{minHeight: '100vh'}}>
            <NavigationMenu className="py-2 w-100 text-lg h-fit mx-4 sm:mx-16 md:mx-32 lg:mx-64 xl:mx-96">
                <div className="flex flex-row items-center gap-5">
                    <Link className="flex flex-row items-center font-bold gap-1" to="/">
                        <MessageCircleCode className="w-5 h-5" />
                        Stories
                    </Link>
                    <NavigationMenuList className="flex flex-row">
                        <Link className="text-sm" to="/test">
                            Nav Link 1
                        </Link>
                    </NavigationMenuList>
                    <NavigationMenuList className="flex flex-row">
                        <Link className="text-sm" to="/test">
                            Nav Link 2
                        </Link>
                    </NavigationMenuList>
                    <NavigationMenuList className="flex flex-row">
                        <Link className="text-sm" to="/test">
                            Nav Link 3
                        </Link>
                    </NavigationMenuList>
                </div>
                <NavigationMenuList className="flex flex-row items-center gap-1">
                    <NavigationMenuItem className="flex items-center">
                        <ThemeSwitch />
                    </NavigationMenuItem>
                    <NavigationMenuItem className="flex items-center">
                        <Button size="sm">
                            <LogIn />
                        </Button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}