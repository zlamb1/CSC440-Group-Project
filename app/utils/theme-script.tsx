import React from "react";
import {defaultColorScheme, prefersColorSchemeCookieName} from "@/utils/prefers-color-scheme";

export function ThemeClientScript() {
    return (
        <script dangerouslySetInnerHTML={{__html: `
            function getCookie(name) {
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
            
            function getPreferredColorScheme() {
                // default to dark
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
                return 'light';
            }
            
            const chPrefersColorScheme = '${prefersColorSchemeCookieName}'; 
            function setColorSchemeCookie(scheme) {
                // set expiration date for 10 years in future
                const expiration = 60 * 60 * 24 * 365 * 10;
                document.cookie = chPrefersColorScheme + '=' + scheme + ';SameSite=Lax;MaxAge=' + expiration + ';Path=/'; 
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
            
            function updateColorScheme() {
                if (typeof window !== "undefined") {
                    const cookie = getCookie(chPrefersColorScheme); 
                    const activeScheme = getActiveScheme(); 
                    const preferredScheme = getPreferredColorScheme(); 
                    if (cookie) {
                        if (cookie === 'system') {
                            if (activeScheme !== preferredScheme) {
                                updateDOM(preferredScheme); 
                            }
                        } else if (activeScheme !== cookie) {
                            updateDOM(cookie); 
                        }
                    } else {
                        updateDOM(preferredScheme);
                        setColorSchemeCookie('${defaultColorScheme}'); 
                    }
                }
            }
            
            if (window && window.matchMedia) {
                updateColorScheme(); 
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => updateColorScheme());
            }
            
            // poll for changes in cookie
            let cachedCookie = getCookie(chPrefersColorScheme); 
            setInterval(() => {
                const cookie = getCookie(chPrefersColorScheme); 
                if (cachedCookie !== cookie) {
                    cachedCookie = cookie;
                    updateColorScheme(cookie); 
                }
            }, 1000); 
        `}} />
    )
}