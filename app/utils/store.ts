const stores: any = {};
const subscribers: any = {};

export function getStore(name: string) {
    return stores[name];
}

export function setStore(name: string, value: any) {
    stores[name] = value;

    if (subscribers[name]) {
        for (const subscriber of subscribers[name]) {
            subscriber(value);
        }
    }
}

export function subscribeStore(name: string, cb: (value: any) => void) {
    if (!subscribers[name]) {
        subscribers[name] = [];
    }

    subscribers[name].push(cb);
}

export function unsubscribeStore(name: string, cb: (value: any) => void) {
    if (subscribers[name]) {
        const indexOf = subscribers[name].indexOf(cb);
        if (indexOf > -1) {
            subscribers[name].splice(indexOf, 1);
        }
    }
}