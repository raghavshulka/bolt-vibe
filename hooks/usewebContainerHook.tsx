"use client"
import { useEffect, useState, useRef } from "react";
import { WebContainer } from '@webcontainer/api';

// Singleton instance to prevent multiple boots
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
    const [isBooting, setIsBooting] = useState(false);
    const isBootingRef = useRef(false);

    useEffect(() => {
        async function main() {
            // If already booted, use existing instance
            if (webcontainerInstance) {
                setWebcontainer(webcontainerInstance);
                setIsBooting(false);
                return;
            }

            // If already booting, wait for it
            if (bootPromise) {
                setIsBooting(true);
                try {
                    const instance = await bootPromise;
                    setWebcontainer(instance);
                    setIsBooting(false);
                } catch (error) {
                    console.error('Failed to boot WebContainer:', error);
                    setIsBooting(false);
                }
                return;
            }

            // Prevent multiple simultaneous boots
            if (isBootingRef.current) {
                return;
            }

            isBootingRef.current = true;
            setIsBooting(true);

            try {
                // Create a single boot promise and start booting immediately
                bootPromise = WebContainer.boot();
                const instance = await bootPromise;
                
                webcontainerInstance = instance;
                setWebcontainer(instance);
                setIsBooting(false);
            } catch (error) {
                console.error('Failed to boot WebContainer:', error);
                bootPromise = null;
                isBootingRef.current = false;
                setIsBooting(false);
            }
        }

        // Start booting immediately, don't wait
        main();

        // Cleanup function
        return () => {
            // Don't destroy the instance on unmount
            // Keep it alive for the app lifetime
        };
    }, []);

    return { webcontainer, isBooting };
}