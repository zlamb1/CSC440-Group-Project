import React, {useEffect, useState} from "react";
import {useFetcher} from "@remix-run/react";
import {Skeleton} from "@ui/skeleton";
import {AnimatePresence, motion} from "framer-motion";
import Post from "@components/post/Post";
import {PostWithRelations, PostWithUser, UserWithLoggedIn} from "@/utils/types";

export interface ReplyViewProps {
    post: PostWithRelations | PostWithUser;
    user: UserWithLoggedIn;
    depth: number;
    showReplies?: boolean;
    onLoad?: (replies: any) => void;
}

export default function ReplyView({ post, user, depth, showReplies = true, onLoad = () => {} }: ReplyViewProps) {
    const hasReplies = 'replies' in post;

    const [ replies, setReplies ] = useState<PostWithUser[]>(hasReplies ? post.replies : []);
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === 'idle' && !hasReplies) {
            setReplies(fetcher.data?.replies);
            onLoad(replies);
        }
    }, [fetcher]);

    useEffect(() => {
        if (!hasReplies) {
            getReplies();
        }
    }, [showReplies]);

    useEffect(() => {
        setReplies(hasReplies ? post.replies : []);
    }, [post]);

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
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2 overflow-hidden">
                        {
                            replies?.map(reply =>
                                <Post key={reply.id} post={reply} viewer={user} depth={depth - 1} autoReply={false} />
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