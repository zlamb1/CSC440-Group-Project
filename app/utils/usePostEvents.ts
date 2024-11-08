import {usePostStore} from "@/utils/usePostStore";
import mitt from "mitt";

export const emitter = mitt();

export enum PostEvent {
    LOAD   = 'post-load',
    CREATE = 'post-create',
    LIKE   = 'post-like',
    EDIT   = 'post-edit',
    DELETE = 'post-delete',
}

function usePostSync() {
    const bc = new BroadcastChannel('stories');

    function getState() {
        return usePostStore.getState();
    }

    bc.onmessage = (evt) => {
        const data = evt.data;
        const state: any = getState();
        switch (data.type) {
            case PostEvent.LOAD: {
                const {post} = data.evt;
                if (state[post.id])
                    state.set(post);
                break;
            }
            case PostEvent.CREATE: {
                const {post} = data.evt;
                state.create(post, false);
                break;
            }
            case PostEvent.LIKE: {
                const {post} = data.evt;
                state.like(post, false);
                break;
            }
            case PostEvent.DELETE: {
                const {post} = data.evt;
                state.delete(post, false);
                break;
            }
        }

        emitter.emit(evt.data.type, { ...evt.data.evt, isBroadcast: true });
    }

    emitter.on('*', (type: any, evt: any) => {
        if (!evt?.isBroadcast) {
            bc.postMessage({
                type, evt
            });
        }
    });
}

if (typeof document !== 'undefined') {
    usePostSync();
}