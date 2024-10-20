import {AnimatePresence, motion} from "framer-motion";
import {Avatar, AvatarFallback, AvatarImage} from "@ui/avatar";

export interface UserAvatarProps {
    className?: string,
    avatar?: any,
    userName: string,
    size?: number | string,
}

function UserAvatarFallback({ userName, size }: { userName: string, size: number | string }) {
    return (
        <motion.div className="origin-center bg-primary flex justify-center items-center w-full h-full rounded-full"
                    style={{ width: size, height: size }}
                    initial={{scale: 0.5, opacity: 0.25}}
                    animate={{scale: 1, opacity: 1}}
                    exit={{scale: 0.5, opacity: 0.25}}
                    transition={{duration: 0.1}}
                    key={0}>
            {userName?.substring(0, 1).toUpperCase()}
        </motion.div>
    );
}

export default function UserAvatar({className, avatar, userName, size = 25}: UserAvatarProps) {
    return (
        <div className={`flex justify-center items-center rounded-full select-none font-medium text-white ` + (className ?? '')}
             style={{width: size, height: size}}>
            <AnimatePresence mode="wait" initial={false}>
                <Avatar className="w-full h-full">
                    {
                        avatar ?
                            <motion.div className="origin-center"
                                        initial={{scale: 0.5, opacity: 0.25}}
                                        animate={{scale: 1, opacity: 1}}
                                        exit={{scale: 0.5, opacity: 0.25}}
                                        transition={{duration: 0.1}}
                                        key={avatar}>
                                <AvatarImage className="object-cover rounded-full" style={{ width: size, height: size }} src={avatar} alt={`${userName}'s avatar image`} />
                                <AvatarFallback>
                                    <UserAvatarFallback size={size} userName={userName} />
                                </AvatarFallback>
                            </motion.div> : <UserAvatarFallback size={size} userName={userName} />
                    }
                </Avatar>
            </AnimatePresence>
        </div>
    );
}