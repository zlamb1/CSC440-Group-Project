import React, {useEffect, useState} from "react";
import {useFetcher} from "@remix-run/react";
import {Skeleton} from "@ui/skeleton";
import {AnimatePresence, motion} from "framer-motion";
import Post from "@components/post/Post";
import {Post as PrismaPost} from "@prisma/client";
import {UserWithLoggedIn} from "@/utils/types";

export interface ReplyViewProps {
    post: PrismaPost;
    user: UserWithLoggedIn;
    showReplies?: boolean;
    onLoad?: (replies: any) => void;
}

export default function ReplyView({ post, user, showReplies = true, onLoad = () => {} }: ReplyViewProps) {
    const [ replies, setReplies ] = useState<any[]>([]);
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === 'idle') {
            setReplies(fetcher.data?.replies);
            onLoad(replies);
        }
    }, [fetcher]);

    useEffect(() => {
        getReplies();
    }, [showReplies]);

    if (post.replyCount === 0) {
        return null;
    }

    function getReplies() {
        if (showReplies) {
            fetcher.submit(null, {
                action: `/posts/${post.id}/replies`,
            });
        }
    }

    function renderSkeletons() {
        const skeletons = [];
        for (let i = 0; i < (post.replyCount ?? 0) - (replies?.length ?? 0); i++) {
            skeletons.push(
                <Skeleton key={i} className="w-full h-[60px]" />
            )
        }
        return skeletons;
    }

    return (
        <AnimatePresence initial={false}>
            {
                showReplies ?
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2 overflow-hidden">
                        {
                            replies?.map((reply: any) =>
                                <Post key={reply.id} post={reply} user={user} />
                            )
                        }
                        {
                            fetcher.state !== 'idle' || replies?.length !== post?.replyCount ? renderSkeletons() : null
                        }
                    </motion.div> : null
            }
            {
                fetcher.state !== 'idle' ? null : null
            }
        </AnimatePresence>
    );
}