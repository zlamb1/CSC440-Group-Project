import {AnimatePresence, motion} from "framer-motion";

export interface UserAvatarProps {
    className?: string,
    avatar?: any,
    userName: string,
    size?: number | string,
}

export default function UserAvatar({ className, avatar, userName, size = 25 }: UserAvatarProps) {
    return (
        <div className={`flex justify-center items-center rounded-full select-none font-medium text-white ` + (className ?? '')}
             style={{ width: size, height: size }}>
            <AnimatePresence mode="wait" initial={false}>
                {
                    avatar ?
                        <motion.div className="origin-center"
                                    initial={{scale: 0.5, opacity: 0.25}}
                                    animate={{scale: 1, opacity: 1}}
                                    exit={{scale: 0.5, opacity: 0.25}}
                                    transition={{duration: 0.1}}
                                    key={avatar}>
                            <img src={avatar} alt="Profile avatar"/>
                        </motion.div> :
                        <motion.div className="origin-center bg-primary flex justify-center items-center w-full h-full rounded-full"
                                    initial={{scale: 0.5, opacity: 0.25}}
                                    animate={{scale: 1, opacity: 1}}
                                    exit={{scale: 0.5, opacity: 0.25}}
                                    transition={{duration: 0.1}}
                                    key={0}>
                            { userName?.substring(0, 1).toUpperCase() }
                        </motion.div>
                }
            </AnimatePresence>
        </div>
    );
}