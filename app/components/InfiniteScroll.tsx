import {ScrollArea} from "@ui/scroll-area";
import {Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";

export type FetchParams<S> = { 
    data: S[], 
    updateData: (newData: S[]) => void,
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    hasMoreData: boolean,
    setHasMoreData: Dispatch<SetStateAction<boolean>>,
    doUpdate: boolean,
};

export type UseInfiniteScrollProps<S> = {
    fetchData: (params: FetchParams<S>) => Promise<void>,
    cmpFn?: (a: S, b: S) => boolean,
    sortFn?: (a: S, b: S) => number,
}

export type InfiniteScrollReturn<S> = [
    S[],
    Dispatch<SetStateAction<S[]>>,
    (newData: S[]) => void,
    boolean,
    () => void,
];

export function useInfiniteScroll<S>({ fetchData, cmpFn = () => false, sortFn }: UseInfiniteScrollProps<S>): InfiniteScrollReturn<S> {
    const [ data, setData ] = useState<S[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ hasMoreData, setHasMoreData ] = useState<boolean>(true);

    useEffect(() => {
        if (isLoading) {
            let doUpdate = true;
            fetchData({ data, updateData, isLoading, setIsLoading, hasMoreData, setHasMoreData, doUpdate })
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

    function updateData(newData: S[]): void {
        setData(prev => {
            if (!prev || !prev.length) {
                return newData;
            }

            const deduped = [];
            // TODO: currently O(n^2), potentially consider alternatives?
            for (const element of newData) {
                for (let i = 0; i < prev.length; i++) {
                    const d = prev[i];
                    if (cmpFn(d, element)) {
                        prev[i] = element;
                        break;
                    } else if (i === prev.length - 1) {
                        deduped.push(element);
                    }
                }
            }

            const newArray = [...prev, ...deduped];
            if (sortFn) return newArray.sort(sortFn);
            return newArray;
        });
    }

    return [ data, setData, updateData, isLoading, loadData ];
}

export interface MaxHeightProps {
    marginBottom: number;
}

export interface InfiniteScrollProps {
    children: ReactNode;
    className?: string;
    containerClass?: string;
    load?: () => void;
    isLoading?: boolean;
    useMaxHeight?: boolean;
    maxHeightProps?: MaxHeightProps;
}

export default function InfiniteScroll({ children, className, containerClass, load, isLoading = false, useMaxHeight = true, maxHeightProps = { marginBottom: 12 } }: InfiniteScrollProps) {
    const ref = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ maxHeight, setMaxHeight ] = useState<string>('none');

    function calculateMaxHeight() {
        if (useMaxHeight && containerRef.current) {
            const y = containerRef.current.getBoundingClientRect().top;
            setMaxHeight(`${window.innerHeight - y - maxHeightProps?.marginBottom}px`);
        } else {
            setMaxHeight('none');
        }
    }

    useEffect(() => {
        window.addEventListener('resize', calculateMaxHeight);
        return () => window.removeEventListener('resize', calculateMaxHeight);
    });

    useEffect(() => {
        calculateMaxHeight();

        if (load && containerRef.current) {
            const options = {
                root: containerRef.current,
            }
            const observer = new IntersectionObserver(entries => {
                if (entries[0].intersectionRatio <= 0) return;
                load();
            }, options);

            if (ref.current) {
                observer.observe(ref.current);
                return () => {
                    if (ref.current) observer.unobserve(ref.current);
                }
            }
        }
    }, [ref, containerRef, children, load]);

    return (
        <ScrollArea className={cn('', className)} style={{maxHeight}} ref={containerRef}>
            <div className={cn("flex flex-col pb-16", containerClass)}>
                { children }
                {
                    isLoading &&
                    <div className="w-full flex justify-center mt-2">
                        <LoadingSpinner />
                    </div>
                }
            </div>
            <div className="w-0 h-0" ref={ref} />
        </ScrollArea>
    )
}