import React from "react";
import {
    colorSchemes, colorSchemeStorageName,
    defaultColorScheme, themes,
    themeStorageName,
} from "@/utils/prefers-color-scheme";

export default function ThemeScript() {
    return (
        <script dangerouslySetInnerHTML={{__html: `            
            class Adapter {
                constructor() {
                    this.items = {}
                    this.pollRate = 100; 
                    this.subscribers = {}
                }
                
                getItem(name) {
                    return this.items[name];
                }
                
                setItem(name, value) {
                    this.items[name] = value;
                }
                
                subscribe(name, cb, notify) {
                    if (notify) {
                        cb(this.getItem(name)); 
                    }
                    if (!this.subscribers[name]) {
                        this.subscribers[name] = []; 
                    }
                    this.subscribers[name].push(cb);
                }
                
                poll(name, cb) {
                    let cachedValue = this.getItem(name); 
                    setInterval(() => {
                        const value = this.getItem(name);
                        if (value !== cachedValue) {
                            cachedValue = value;
                            cb(value);
                            if (this.subscribers[name]) {
                                for (const subscriber of this.subscribers[name]) {
                                    subscriber(value); 
                                }
                            }
                        }
                    }, this.pollRate);
                }
            }
            
            class CookieAdapter extends Adapter {
                static isEnabled() {
                    let cookieEnabled = navigator.cookieEnabled;
                    if (cookieEnabled) {
                        try {
                            document.cookie = 'cookietest=1; SameSite=Lax;';
                            const ret = document.cookie.indexOf('cookietest=') !== -1;
                            document.cookie = 'cookietest=1; SameSite=Lax; Expires=Thu, 01-Jan-1970 00:00:01 GMT';
                            return ret;
                        } catch (err) {
                            return false;
                        }
                    }
                    return cookieEnabled;
                }
                
                constructor() {
                    super(); 
                }
                
                getItem(name) {
                    name = name + "=";
                    const decodedCookies = decodeURIComponent(document.cookie);
                    const cookies = decodedCookies.split(';');
                    for (let cookie of cookies) {
                        while (cookie.charAt(0) === ' ')
                            cookie = cookie.substring(1); 
                        if (cookie.indexOf(name) == 0)
                            return cookie.substring(name.length, cookie.length); 
                    }
                    return null;
                }
                
                setItem(name, value) {
                    const expiration = 60 * 60 * 24 * 365 * 10;
                    document.cookie = name + '=' + value + ';SameSite=Lax;Max-Age=' + expiration + ';Path=/'; 
                }
            }
            
            class StorageAdapter extends Adapter {
                static isEnabled() {
                    try {
                        localStorage.setItem('storagetest', 'true'); 
                        if (localStorage.getItem('storagetest') !== 'true') {
                            return false; 
                        }
                        localStorage.removeItem('storagetest');
                        return true; 
                    } catch (err) {
                        return false; 
                    }
                }
                
                constructor() {
                    super(); 
                }
                
                getItem(name) {
                    return localStorage.getItem(name);
                }
                
                setItem(name, value) {
                    localStorage.setItem(name, value); 
                }
            }
            
            function createAdapter() {
                if (CookieAdapter.isEnabled()) 
                    return new CookieAdapter(); 
                if (StorageAdapter.isEnabled())
                    return new StorageAdapter();
                // return default adapter (won't persist data)
                return new Adapter(); 
            }
            
            const adapter = createAdapter(); 
            const mediaQuery = window ? (window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : undefined) : undefined; 
            
            function getPreferredColorScheme() {
                if (window.matchMedia) {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        return 'dark'; 
                    }
                    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                        return 'light'; 
                    }
                }
                return '${defaultColorScheme}';
            }
    
            function getActiveTheme() {
                return document.documentElement.dataset.theme;
            }
            
            function updateDOM(colorScheme) {
                const htmlElement = document.documentElement; 
                const dataColorScheme = htmlElement.dataset.colorScheme;
                if (dataColorScheme !== colorScheme) {
                    // use view-transition if the API is supported and its not the first load
                    if (dataColorScheme && document.startViewTransition) {
                        document.startViewTransition(() => {
                            htmlElement.classList.remove(dataColorScheme); 
                            htmlElement.classList.add(colorScheme);
                        });
                    } else {
                        htmlElement.classList.remove(dataColorScheme); 
                        htmlElement.classList.add(colorScheme);
                    }
                    htmlElement.dataset.colorScheme = colorScheme;
                    // update color scheme storage
                    adapter.setItem('${colorSchemeStorageName}', colorScheme);
                }
            }
            
            function getColorScheme(theme) {
                if (theme === 'system' && mediaQuery) return getPreferredColorScheme(); 
                if (![${colorSchemes.map(colorScheme => `'${colorScheme}'`).join(',')}].includes(theme)) {
                    return '${defaultColorScheme}';
                }
                return theme; 
            }
            
            function updateTheme(value) {
                if (typeof window !== "undefined") {
                    value = value ?? adapter.getItem('${themeStorageName}');
                    const activeTheme = getActiveTheme(); 
                    const preferredScheme = getPreferredColorScheme(); 
                    if (value) {
                        if (activeTheme === value && value === 'system') {
                            updateDOM(preferredScheme);
                        }
                        if (activeTheme !== value) {
                            document.documentElement.dataset.theme = value; 
                            adapter.setItem('${themeStorageName}', value); 
                            updateDOM(getColorScheme(value)); 
                        }
                    } else if (mediaQuery) {
                        document.documentElement.dataset.theme = 'system'; 
                        adapter.setItem('${themeStorageName}', 'system');
                        updateDOM(preferredScheme);
                    } else {
                        document.documentElement.dataset.theme = '${defaultColorScheme}'; 
                        adapter.setItem('${themeStorageName}', '${defaultColorScheme}'); 
                        updateDOM('${defaultColorScheme}');
                    }
                }
            }
           
            function initializeTheme() {
                updateTheme(); 
                adapter.poll('${themeStorageName}', updateTheme); 
                if (mediaQuery) {
                    mediaQuery.addEventListener('change', e => updateTheme());
                }
            }
            
            if (typeof document !== 'undefined') {
                initializeTheme(); 
            }
        `}} />
    )
}