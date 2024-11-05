import React, {useEffect, useState} from "react";
import {useFetcher} from "@remix-run/react";
import {Skeleton} from "@ui/skeleton";
import {AnimatePresence, motion} from "framer-motion";
import Post from "@components/post/Post";
import {PostWithRelations, PostWithReplies, PostWithUser, UserWithLoggedIn} from "@/utils/types";
import {usePostStore} from "@/utils/usePostStore";

export interface ReplyViewProps {
    post: PostWithReplies;
    user: UserWithLoggedIn;
    depth: number;
    showReplies?: boolean;
    onLoad?: (replies: any) => void;
}

export default function ReplyView({ post, user, depth, showReplies = true, onLoad = () => {} }: ReplyViewProps) {
    if (!post?.replies || !post?.replies?.length) {
        return null;
    }

    const replies = post.replies;

    return (
        <AnimatePresence initial={false}>
            {
                showReplies ?
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2 overflow-hidden">
                        {
                            replies?.map(reply =>
                                <Post key={reply} id={reply} viewer={user} depth={depth - 1} autoReply={false} />
                            )
                        }
                    </motion.div> : null
            }
        </AnimatePresence>
    );
}