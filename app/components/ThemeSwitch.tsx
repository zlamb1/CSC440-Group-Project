import {Computer, FileQuestion, Laptop, Moon, Sun} from "lucide-react";
import {themes, useTheme} from "@/utils/prefers-color-scheme";
import {useEffect, useState} from "react";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu";
import {Button} from "@ui/button";
import {AnimatePresence} from "framer-motion";
import {Separator} from "@ui/separator";
import {motion} from 'framer-motion';

interface ThemeIcons {
    [index: string]: React.FunctionComponent
}

const themeIcons: ThemeIcons = {
    light: Sun,
    dark: Moon,
    system: Laptop,
}

const colorSchemeIcons = {
    'light': Sun,
    'dark': Moon,
}

export default function ThemeSwitch() {
    const [isMounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    });
    const { themeStore, setTheme } = useTheme();
    // @ts-ignore
    const SchemeIcon = isMounted ? (colorSchemeIcons[themeStore.colorScheme] ?? FileQuestion) : FileQuestion;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                <Button className="w-fit h-fit p-2" variant="ghost" size="icon">
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div key={SchemeIcon.displayName}
                                    initial={{y: '100%', opacity: 0.5, scale: 0.25}}
                                    animate={{y: 0, opacity: 1, scale: 1}}
                                    exit={{y: '100%', opacity: 0.5, scale: 0.25}}
                                    transition={{duration: 0.1}}>
                            <SchemeIcon className={"w-[20px] h-[20px] " + (isMounted ? '' : 'invisible')} />
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
                                <DropdownMenuRadioItem value={theme} className="text-xl md:text-xl flex flex-row flex-nowrap justify-between gap-2">
                                    {theme.charAt(0).toUpperCase() + theme.substring(1)}
                                    {React.createElement(themeIcons[theme], {})}
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