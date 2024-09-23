import React from "react";
import {
    colorSchemes,
    defaultFallbackColorScheme,
    prefersColorSchemeCookieName
} from "@/utils/prefers-color-scheme";

export function ThemeClientScript() {
    return (
        <script dangerouslySetInnerHTML={{__html: `
            class Adapter {
                constructor() {
                    this.pollRate = 1000; 
                    this.poll = (name, fn) => {
                        let cachedValue = this.getItem(name); 
                        setInterval(() => {
                            const value = this.getItem(name);
                            if (value !== cachedValue) {
                                cachedValue = value;
                                fn(value); 
                            }
                        }, this.pollRate);
                    }
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
                    this.getItem = (name) => {
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
                    this.setItem = (name, value) => {
                        const expiration = 60 * 60 * 24 * 365 * 10;
                        document.cookie = name + '=' + value + ';Same-Site=Lax;Max-Age=' + expiration + ';Path=/'; 
                    }
                }
            }
            
            class StorageAdapter extends Adapter {
                static isEnabled() {
                    try {
                        localStorage.setItem('local_storage_enabled', true); 
                        if (localStorage.getItem('local_storage_enabled') !== 'true') {
                            return false; 
                        }
                        localStorage.removeItem('local_storage_enabled');
                        return true; 
                    } catch (err) {
                        return false; 
                    }
                }
                constructor() {
                    super(); 
                    this.getItem = (name) => localStorage.getItem(name);
                    this.setItem = (name, value) => localStorage.setItem(name, value); 
                }
            }
            
            class MockAdapter {
                static isEnabled() { return true; } 
                constructor() {
                    this.getItem = (name) => {}
                    this.setItem = (name, value) => {}
                    this.poll = (name, fn) => {}
                }
            }
            
            function createAdapter() {
                if (CookieAdapter.isEnabled()) 
                    return new CookieAdapter(); 
                if (StorageAdapter.isEnabled())
                    return new StorageAdapter();
                return new MockAdapter(); 
            }
            
            const chPrefersColorScheme = '${prefersColorSchemeCookieName}'; 
            const adapter = createAdapter(); 
            const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : undefined; 
            
            function getPreferredColorScheme() {
                if (window.matchMedia) {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        return 'dark'; 
                    }
                    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                        return 'light'; 
                    }
                }
                return '${defaultFallbackColorScheme}';
            }
    
            function getActiveScheme() {
                return document.documentElement.dataset.theme;
            }
            
            function updateDOM(scheme) {
                const htmlElement = document.documentElement; 
                const dataTheme = htmlElement.dataset.theme;
                if (dataTheme !== scheme) {
                    htmlElement.classList.remove(htmlElement.dataset.theme); 
                    htmlElement.classList.add(scheme);
                    htmlElement.dataset.theme = scheme;
                }
            }
            
            function validateColorScheme(scheme) {
                if (scheme === 'system' && !mediaQuery) return { scheme: '${defaultFallbackColorScheme}', transformed: true }; 
                if (![${colorSchemes.map(scheme => `'${scheme}'`).join(',')}].includes(scheme)) {
                    return { scheme: '${defaultFallbackColorScheme}', transformed: true };
                }
                return { scheme, transformed: false }; 
            }
            
            function updateColorScheme(value) {
                if (typeof window !== "undefined") {
                    value = value ?? adapter.getItem(chPrefersColorScheme);
                    const activeScheme = getActiveScheme(); 
                    const preferredScheme = getPreferredColorScheme(); 
                    if (value) {
                        const { scheme, transformed } = validateColorScheme(value); 
                        if (scheme === 'system') {
                            if (activeScheme !== preferredScheme) {
                                updateDOM(preferredScheme); 
                            }
                        } else if (activeScheme !== scheme) {
                            updateDOM(scheme); 
                        }
                        if (transformed) {
                            adapter.setItem(chPrefersColorScheme, scheme); 
                        }
                    } else if (mediaQuery) {
                        updateDOM(preferredScheme);
                        adapter.setItem(chPrefersColorScheme, preferredScheme);
                    } else {
                        updateDOM('${defaultFallbackColorScheme}');
                        adapter.setItem(chPrefersColorScheme, ${defaultFallbackColorScheme});
                    }
                }
            }
            
            updateColorScheme(); 
            adapter.poll(chPrefersColorScheme, updateColorScheme); 
            
            if (mediaQuery) {
                mediaQuery.addEventListener('change', e => updateColorScheme());
                // backward-compatability
                mediaQuery.addListener(e => updateColorScheme());
            }
        `}} />
    )
}