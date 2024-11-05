const stores: any = {};
const subscribers: any = {};

export type Store = {
    id: number;
    value: any;
}

export function setStore(name: string, value: any) {
    if (!stores[name]) {
        stores[name] = [];
    }

    const id = stores[name].length;
    const store: Store = { id, value };
    stores[name].push(store);

    if (subscribers[name]) {
        for (const subscriber of subscribers[name]) {
            subscriber(value, id);
        }
    }
}

export type StoreCallback = ((value: any) => void) | ((value: any, id: number) => void);

export function subscribeStore({ name, cb, id = -1 }: { name: string, cb: StoreCallback, id: number }) {
    if (!subscribers[name]) {
        subscribers[name] = [];
    }

    const array = stores[name];
    if (array?.length && id > -1) {
        for (let i = id; i < array.length; i++) {
            const store = array[i];
            cb(store.value, store.id);
        }
    }

    subscribers[name].push(cb);
}

export function unsubscribeStore(name: string, cb: StoreCallback) {
    if (subscribers[name]) {
        const indexOf = subscribers[name].indexOf(cb);
        if (indexOf > -1) {
            subscribers[name].splice(indexOf, 1);
        }
    }
}