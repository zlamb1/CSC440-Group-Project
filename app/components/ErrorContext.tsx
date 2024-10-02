import {AnimatePresence, motion} from "framer-motion";

export interface ErrorContextProps {
    msg?: string;
}

export function ErrorContext({msg}: ErrorContextProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.p key={msg} className={`text-red-600 text-xs text-nowrap select-none overflow-hidden`}
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.1 }}>
                {msg}
            </motion.p>
        </AnimatePresence>
    )
}