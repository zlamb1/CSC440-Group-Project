import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, {useState} from "react";
import {MessageSquare, ThumbsDown, ThumbsUp} from "lucide-react";
import {useFetcher} from "@remix-run/react";
import ContextMenu from "@components/post/ContextMenu";
import PostView from "@components/post/PostView";

function getIsLiked(state: any) {
    if (state == null || state == 'null') {
        return null;
    }
    return state === true || state === 'true';
}

function getLikeCount(likeCount: number, oldState: any, state: any) {
    const oldIsLiked = getIsLiked(oldState);
    const newIsLiked = getIsLiked(state);
    if (oldIsLiked !== newIsLiked) {
        if (oldIsLiked === null) {
            return likeCount + (newIsLiked ? 1 : -1);
        } else if (newIsLiked === null) {
            return likeCount + (oldIsLiked ? -1 : 1);
        } else {
            return likeCount + (newIsLiked ? 2 : -2);
        }
    }
    return likeCount;
}

function Post({className, post, user}: { className?: string, post: any, user: any }) {
    const [ isEditing, setEditing ] = useState<boolean>(false);
    const likeFetcher = useFetcher();
    const isLiked = likeFetcher.formData ? getIsLiked(likeFetcher.formData.get('liked')) : post.liked;
    const likeCount = likeFetcher.formData ? getLikeCount(post.likeCount, post.liked, likeFetcher.formData.get('liked')) : post.likeCount;
    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserAvatar avatar={post.avatarPath} userName={post.userName} />
                        <span className="font-bold">{post.userName}</span>
                    </div>
                    <ContextMenu post={post} user={user} onEdit={ () => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <PostView post={post} isEditing={isEditing} onIsEditingChange={ (_isEditing: boolean) => setEditing(_isEditing) } />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-900">
                            <likeFetcher.Form method="POST" action={`/posts/${post.id}/like`} className="flex items-center">
                                <Button className="w-[24px] h-[24px] rounded-full"
                                        variant="ghost"
                                        size="icon"
                                        type="submit"
                                        disabled={!user?.loggedIn}>
                                    <input className="hidden" name="liked" value={ isLiked === true ? 'null' : 'true' } readOnly />
                                    <ThumbsUp size={16} className={"stroke-primary " + (isLiked === true ? 'fill-primary' : '')} />
                                </Button>
                            </likeFetcher.Form>
                            <span className="select-none text-sm font-medium">{likeCount}</span>
                            <likeFetcher.Form method="POST" action={`/posts/${post.id}/like`}>
                                <Button className="w-[24px] h-[24px] rounded-full"
                                        variant="ghost"
                                        size="icon"
                                        type="submit"
                                        disabled={!user?.loggedIn}>
                                    <input className="hidden" name="liked" value={ isLiked === false ? 'null' : 'false' } readOnly />
                                    <ThumbsDown size={16} className={"stroke-primary " + (isLiked === false ? 'fill-primary' : '')} />
                                </Button>
                            </likeFetcher.Form>
                        </div>
                        <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-900">
                            <Button className="h-[25px] flex gap-1 items-center rounded-full" size="icon" variant="ghost">
                                <MessageSquare size={16} />
                                <span className="text-bold">{ post.replyCount }</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(Post);