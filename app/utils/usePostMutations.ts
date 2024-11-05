import {PostWithRelations} from "@/utils/types";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {setStore, subscribeStore, unsubscribeStore} from "@/utils/store";

const postStoreName = 'post-mutations';

export default function usePostMutations({ setPosts, updatePosts }: { setPosts?: Dispatch<SetStateAction<PostWithRelations[]>>, updatePosts?: (newPosts: PostWithRelations[]) => void }) {
    const [ id, setID ] = useState(0);

    async function onMutatePosts(value: any, id: number) {
        setID(id + 1);
        if (value?.type === 'create' && value?.post && updatePosts) {
            updatePosts([ value.post ]);
        }
        if (value?.type === 'reply' && value?.post) {


        }
        if (value?.type === 'delete' && value?.id && setPosts) {
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

    function deletePost(id: string) {
        setStore(postStoreName, {
            type: 'delete', id
        });
    }

    return { createPost, deletePost };
}