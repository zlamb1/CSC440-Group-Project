import {ScrollArea} from "@ui/scroll-area";
import {Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";

export type FetchParams<S> = { 
    data: S[], 
    setData: Dispatch<SetStateAction<S[]>>, 
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    hasMoreData: boolean,
    setHasMoreData: Dispatch<SetStateAction<boolean>>,
    doUpdate: boolean,
};

export type InfiniteScrollReturn<S> = [
    S[],
    Dispatch<SetStateAction<S[]>>,
    boolean,
    () => void
];

export function useInfiniteScroll<S>({ fetchData }: { fetchData: (params: FetchParams<S>) => Promise<void> }): InfiniteScrollReturn<S> {
    const [ data, setData ] = useState<S[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ hasMoreData, setHasMoreData ] = useState<boolean>(true);

    useEffect(() => {
        if (isLoading) {
            let doUpdate = true;
            fetchData({ data, setData, isLoading, setIsLoading, hasMoreData, setHasMoreData, doUpdate })
                .then(() => {
                    if (doUpdate) {
                        setIsLoading(false);
                    }
                });
            return () => {
                doUpdate = false;
            };
        }
    }, [isLoading]);

    function loadData() {
        if (!isLoading && hasMoreData) {
            setIsLoading(true);
        }
    }

    return [ data, setData, isLoading, loadData ];
}

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