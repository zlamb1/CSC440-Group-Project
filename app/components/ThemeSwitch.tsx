import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu";
import {Button} from "@ui/button";
import {FileQuestion, Moon, Sun} from "lucide-react";
import {themes, useTheme} from "@/utils/prefers-color-scheme";
import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useState} from "react";
import {Separator} from "@ui/separator";
import React from "react";

const themeMeta = {
    'light': { icon: Sun },
    'dark': { icon: Moon },
}

export default function ThemeSwitch() {
    const [isMounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    });
    const { themeStore, setTheme } = useTheme();
    // @ts-ignore
    const meta = isMounted ? (themeMeta[themeStore.colorScheme] ?? { icon: FileQuestion, key: 'unknown' }) : { icon: FileQuestion, key: 'ssr' };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                <Button className="w-fit h-fit p-2" variant="ghost" size="icon">
                    <AnimatePresence mode="wait">
                        <motion.div key={meta.icon.displayName}
                                    initial={{y: '100%', opacity: 0.5, scale: 0.25}}
                                    animate={{y: 0, opacity: 1, scale: 1}}
                                    exit={{y: '100%', opacity: 0.5, scale: 0.25}}
                                    transition={{duration: 0.1}}>
                            <meta.icon className={"w-[40px] h-[40px] lg:w-[48px] lg:h-[48px] xl:w-[56px] xl:h-[56px]  " + (isMounted ? '' : 'invisible')} />
                        </motion.div>
                    </AnimatePresence>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup className="p-0" value={themeStore.theme} onValueChange={setTheme}>
                    {
                        themes.map((theme, index) => (
                            <React.Fragment key={theme}>
                                <DropdownMenuRadioItem value={theme} className={'text-xl md:text-2xl'}>
                                    {theme.charAt(0).toUpperCase() + theme.substring(1)}
                                </DropdownMenuRadioItem>
                                { index !== themes.length - 1 && <Separator /> }
                            </React.Fragment>
                        ))
                    }
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}