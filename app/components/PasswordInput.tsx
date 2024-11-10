import {InputHTMLAttributes, useEffect, useState} from "react";
import {Input} from "@ui/input";
import {cn} from "@/lib/utils";
import * as React from "react";
import {Eye, EyeOff, InfoIcon} from "lucide-react";
import {Button} from "@ui/button";
import {AnimatePresence, motion} from "framer-motion";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    password?: string;
    error?: string;
    useStrength?: boolean;
}

export default function PasswordInput({ password, error, useStrength = true, ...props }: PasswordInputProps) {
    const [strength, setStrength] = useState<number>(0);
    const [hidden, setHidden] = useState<boolean>(true);
    const [_error, setError] = useState<string | undefined>(error);

    const colors = [ 'red', 'yellow', '#03C03C' ];
    const strengths = [ 'Weak', 'Medium', 'Strong' ];

    useEffect(() => {
        if (useStrength) {
            const length = password?.length ?? 0;

            if (!length) {
                setError('');
                return setStrength(0);
            }

            if (!password?.match(/[A-Z]+/)) {
                setError('Password must contain an uppercase letter.');
                return setStrength(0);
            }

            if (!password?.match(/[0-9]+/)) {
                setError('Password must contain a digit.');
                return setStrength(0);
            }

            if (length < 8) {
                setError('Password must be at least 8 characters.');
                return setStrength(0);
            }

            setError('');

            if (length > 10 || password?.match(/[$&+,:;=?@#|'<>.^*()%!-]+/)) {
                setStrength(2);
            } else {
                setStrength(1);
            }
        } else {
            setError('');
            setStrength(0);
        }
    }, [password, useStrength]);

    useEffect(() => {
        setError(error);
    }, [error]);

    function HoverContent() {
        switch (strength) {
            case 0:
                return (
                    <ul className="text-sm" style={{listStyle: 'inside'}}>
                        <li>Password must be at least eight characters long.</li>
                        <li>Password must contain a capital letter.</li>
                        <li>Password must contain a digit.</li>
                    </ul>
                );
            case 1:
                return (
                    <ul className="text-sm" style={{listStyle: 'inside'}}>
                        <li>Consider making password longer.</li>
                        <li>Consider adding special characters.</li>
                    </ul>
                );
        }
    }

    function append() {
        return (
            <Button className="size-[24px] rounded-full" variant="ghost" type="button" size="icon"
                    onClick={() => setHidden(prev => !prev)}>
                {hidden ? <Eye size={16}/> : <EyeOff size={16}/>}
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-[400px]">
            <Input className={cn(_error && "border border-red-700")}
                   append={append()}
                   type={hidden ? 'password' : 'text'}
                   value={password}
                   required
                   {...props}
            />
            <AnimatePresence>
                {password ?
                    <motion.div className="flex flex-col gap-1 overflow-y-hidden mx-1"
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                    >
                        {
                            useStrength &&
                            <div className="w-full h-[1px] rounded-full bg-gray-300 dark:bg-gray-600 relative">
                                <div className="absolute left-0 h-full rounded-full" style={{
                                    transition: 'all 0.25s ease-in-out',
                                    right: (33 * (2 - strength)) + '%',
                                    backgroundColor: colors[strength]
                                }}/>
                            </div>
                        }
                        <div className="flex items-center justify-between">
                            <div className="text-red-700 text-xs select-none">{_error}</div>
                            {
                                useStrength &&
                                <div className="flex items-center gap-1" style={{
                                    transition: 'all 0.25s ease-in-out',
                                    color: colors[strength]
                                }}>
                                    <div className="select-none text-xs font-bold">
                                        {strengths[strength]}
                                    </div>
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            {strength !== 2 && <InfoIcon size={14}/>}
                                        </HoverCardTrigger>
                                        <HoverCardContent style={{color: colors[strength]}}>
                                            {HoverContent()}
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            }
                        </div>
                    </motion.div> : null
                }
            </AnimatePresence>
        </div>
    );
}