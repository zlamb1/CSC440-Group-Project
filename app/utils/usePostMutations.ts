import {PostWithRelations} from "@/utils/types";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {setStore, subscribeStore, unsubscribeStore} from "@/utils/store";

const postStoreName = 'post-mutations';

export default function usePostMutations({ setPosts, updatePosts }: { setPosts?: Dispatch<SetStateAction<PostWithRelations[]>>, updatePosts?: (newPosts: PostWithRelations[]) => void }) {
    const [ id, setID ] = useState(0);

    async function onMutatePosts(value: any, id: number) {
        setID(id + 1);
        switch (value?.type) {
            case 'create':
                if (value?.post && updatePosts) {
                    updatePosts([ value.post ]);
                }
                break;
            case 'edit':
                if (value?.post && setPosts) {
                    setPosts(prev => {
                        const indexOf = prev?.findIndex(post => post.id === value.post.id);
                        if (indexOf > -1) {
                            const newArray = [...prev];
                            newArray[indexOf] = value.post;
                            return newArray;
                        }

                        return prev;
                    });
                }
                break;
            case 'reply':
                if (value?.post && setPosts) {
                    setPosts(prev => {
                        return prev;
                    });
                }
                break;
            case 'delete':
                if (value?.id && setPosts) {
                    setPosts(prev => {
                        const indexOf = prev?.findIndex(post => post.id === value.id);
                        if (indexOf > -1) {
                            const newArray = [...prev];
                            newArray.splice(indexOf, 1);
                            return newArray;
                        }

                        return prev;
                    });
                }
                break;
        }
    }

    useEffect(() => {
        subscribeStore({ name: postStoreName, cb: onMutatePosts, id });
        return () => unsubscribeStore(postStoreName, onMutatePosts);
    });

    function createPost(post: PostWithRelations) {
        setStore(postStoreName, {
            type: 'create', post
        });
    }

    function editPost(post: PostWithRelations) {
        setStore(postStoreName, {
            type: 'edit', post
        });
    }

    function createReply(post: PostWithRelations) {
        setStore(postStoreName, {
            type: 'reply', post
        });
    }

    function deletePost(id: string) {
        setStore(postStoreName, {
            type: 'delete', id
        });
    }

    return { createPost, editPost, createReply, deletePost };
}