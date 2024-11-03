import {startTransition, useEffect, useState} from "react";

export const cookiePreferenceStorageName = 'client-cookie-preference';

export const themeStorageName = 'client-hint-prefers-theme';
export const colorSchemeStorageName = 'client-hint-prefers-color-scheme';
export const defaultColorScheme = 'dark';

export const colorSchemes = [ 'light', 'dark' ];
export const themes = [ 'light', 'dark', 'system' ];

interface ThemeStore {
    colorScheme?: string,
    theme?: string,
}

const _themeStore: ThemeStore = {
    colorScheme: typeof document !== 'undefined' ? document.documentElement.dataset.colorScheme : defaultColorScheme,
    theme: typeof document !== 'undefined' ? document.documentElement.dataset.theme : defaultColorScheme,
}

let themeStoreObservers: any[] = [];

let observer: MutationObserver;

export function useTheme() {
    const [ themeStore, setThemeStore ] = useState<ThemeStore>(_themeStore);
    useEffect(() => {
        if (!observer) {
            // lazy-load document theme observer
            observer = new MutationObserver((mutations, observer) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes') {
                        const name = mutation.attributeName;
                        if (name === 'data-color-scheme' || name === 'data-theme') {
                            // update values
                            _themeStore.colorScheme = document.documentElement.dataset.colorScheme;
                            _themeStore.theme = document.documentElement.dataset.theme;
                            // notify observers
                            for (const observer of themeStoreObservers) {
                                observer({..._themeStore});
                            }
                        }
                    }
                }
            });
            observer.observe(document.documentElement, {
                attributes: true,
            });
        }
        themeStoreObservers.push(setThemeStore);
        // clean up on unmount
        return () => {
            themeStoreObservers = themeStoreObservers.filter(observer => observer !== setThemeStore);
        }
    });
    function setTheme(theme: string) {
        // @ts-ignore
        if (typeof adapter !== 'undefined') {
            // @ts-ignore
            adapter.setItem(themeStorageName, theme)
        }
    }
    return { themeStore, setTheme };
}