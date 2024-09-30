import {Computer, FileQuestion, Laptop, Moon, Sun} from "lucide-react";
import {themes, useTheme} from "@/utils/prefers-color-scheme";
import {useEffect, useState} from "react";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuPortal,
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
    const [counter, setCounter] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { themeStore, setTheme } = useTheme();
    useEffect(() => {
        setCounter(counter + 1);
    }, [themeStore]);
    // @ts-ignore
    const SchemeIcon = isMounted ? (colorSchemeIcons[themeStore.colorScheme] ?? FileQuestion) : FileQuestion;
    const variants = {
        hidden: {
            y: '100%',
            opacity: 0.5,
            scale: 0.25
        },
        appear: {
            opacity: 0.5,
            scale: 0.25,
        },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
        }
    }
    function onClick(theme: string) {
        setIsOpen(false);
        setTheme(theme);
    }
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button className="w-fit h-fit p-2" variant="ghost" size="icon">
                    <AnimatePresence mode="wait">
                        <motion.div key={SchemeIcon.displayName}
                                    initial={counter > 1 ? 'hidden' : 'appear'}
                                    animate="visible"
                                    exit="hidden"
                                    variants={variants}
                                    transition={{duration: 0.1}}>
                            <SchemeIcon className={"w-[20px] h-[20px] " + (isMounted ? '' : 'invisible')} />
                        </motion.div>
                    </AnimatePresence>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col">
                {
                    themes.map((theme, index) => (
                        <React.Fragment key={theme}>
                            <Button className="flex flex-row w-full justify-between" variant="ghost" onClick={() => onClick(theme)} noClickAnimation>
                                {theme.charAt(0).toUpperCase() + theme.substring(1)}
                                {React.createElement(themeIcons[theme], {})}
                            </Button>
                            { index !== themes.length - 1 && <Separator /> }
                        </React.Fragment>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}