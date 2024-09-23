import React from "react";
import {
    colorSchemes,
    defaultColorScheme,
    defaultFallbackColorScheme,
    prefersColorSchemeCookieName
} from "@/utils/prefers-color-scheme";

export function ThemeClientScript() {
    return (
        <script dangerouslySetInnerHTML={{__html: `
            function testCookies() {
                let cookieEnabled = navigator.cookieEnabled;
                if (cookieEnabled) {
                    try {
                        document.cookie = 'cookietest=1';
                        const ret = document.cookie.indexOf('cookietest=') !== -1;
                        // delete cookie
                        document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
                        return ret;
                    } catch (err) {
                        return false;
                    }
                }
                return cookieEnabled;
            }
        
            function testLocalStorage() {
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
            
            const cookieEnabled = testCookies();
            const storageEnabled = testLocalStorage(); 
            const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : undefined; 
                
            function getCookie(name) {
                if (cookieEnabled) {
                    name = name + "=";
                    const decodedCookies = decodeURIComponent(document.cookie);
                    const cookies = decodedCookies.split(';');
                    for (let cookie of cookies) {
                        while (cookie.charAt(0) === ' ')
                            cookie = cookie.substring(1); 
                        if (cookie.indexOf(name) == 0)
                            return cookie.substring(name.length, cookie.length); 
                    }
                }
                return null;
            }
            
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
            
            const chPrefersColorScheme = '${prefersColorSchemeCookieName}'; 
            function setColorSchemeCookie(scheme) {
                if (cookieEnabled) {
                    // set expiration date for 10 years in future
                    const expiration = 60 * 60 * 24 * 365 * 10;
                    document.cookie = chPrefersColorScheme + '=' + scheme + ';Same-Site=Lax;Max-Age=' + expiration + ';Path=/'; 
                }
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
                if (scheme === 'system' && !mediaQuery) return false; 
                return [${colorSchemes.map(scheme => `'${scheme}'`).join(',')}].includes(scheme); 
            }
            
            function updateColorScheme(value) {
                if (typeof window !== "undefined") {
                    const cookie = value ?? getCookie(chPrefersColorScheme); 
                    const activeScheme = getActiveScheme(); 
                    const preferredScheme = getPreferredColorScheme(); 
                    if (cookieEnabled) {
                        if (cookie) {
                            if (cookie === 'system') {
                                if (activeScheme !== preferredScheme) {
                                    updateDOM(preferredScheme); 
                                }
                            } else if (activeScheme !== cookie) {
                                updateDOM(cookie); 
                            }
                        } else if (mediaQuery) {
                            updateDOM(preferredScheme);
                            setColorSchemeCookie('${defaultColorScheme}'); 
                        } else {
                            updateDOM('${defaultFallbackColorScheme}');
                            setColorSchemeCookie('${defaultFallbackColorScheme}'); 
                        }
                    } else if (storageEnabled) {
                        // fallback to localStorage
                        const storageScheme = value ?? localStorage.getItem(chPrefersColorScheme);
                        if (storageScheme && validateColorScheme(storageScheme)) {
                            if (storageScheme === 'system') {
                                updateDOM(preferredScheme); 
                            } else {
                                updateDOM(storageScheme); 
                            }
                        } else if (mediaQuery) {
                            updateDOM(preferredScheme);
                            localStorage.setItem(chPrefersColorScheme, preferredScheme);
                        } else {
                            updateDOM('${defaultFallbackColorScheme}');
                            localStorage.setItem(chPrefersColorScheme, '${defaultFallbackColorScheme}');
                        }
                    } else {
                        updateDOM('${defaultFallbackColorScheme}'); 
                    }
                }
            }
            
            updateColorScheme(); 
            
            if (mediaQuery) {
                mediaQuery.addEventListener('change', e => updateColorScheme());
                // backward-compatability
                mediaQuery.addListener(e => updateColorScheme());
            }
            
            if (cookieEnabled) {
                // poll for changes in cookie
                let cachedCookie = getCookie(chPrefersColorScheme); 
                setInterval(() => {
                    const cookie = getCookie(chPrefersColorScheme); 
                    if (cachedCookie !== cookie) {
                        cachedCookie = cookie;
                        updateColorScheme(cookie); 
                    }
                }, 1000); 
            } else if (storageEnabled) {
                // poll for changes in localStorage
                let cachedValue = localStorage.getItem(chPrefersColorScheme); 
                setInterval(() => {
                    const value = localStorage.getItem(chPrefersColorScheme); 
                    if (cachedValue !== value) {
                        cachedValue = value;
                        updateColorScheme(value); 
                    }
                }, 1000); 
            }
        `}} />
    )
}