import {ScrollArea} from "@ui/scroll-area";
import {ReactNode, useEffect, useRef} from "react";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";

export interface InfiniteScrollProps {
    children: ReactNode;
    className?: string;
    containerClass?: string;
    load?: () => void;
    isLoading?: boolean;
}

export default function InfiniteScroll({ children, className, containerClass, load, isLoading = false }: InfiniteScrollProps) {
    const ref = useRef(null);

    useEffect(() => {
        if (load) {
            const observer = new IntersectionObserver(entries => {
                if (entries[0].intersectionRatio <= 0) return;
                load();
            });

            if (ref.current) {
                observer.observe(ref.current);
                return () => {
                    if (ref.current) observer.unobserve(ref.current);
                }
            }
        }
    }, [ref, children, load]);

    return (
        <ScrollArea className={cn('relative', className)}>
            <div className={cn("flex flex-col", containerClass)}>
                { children }
                {
                    isLoading &&
                    <div className="w-full flex justify-center mt-2">
                        <LoadingSpinner />
                    </div>
                }
            </div>
            <div className="absolute bottom-0" ref={ref} />
        </ScrollArea>
    )
}