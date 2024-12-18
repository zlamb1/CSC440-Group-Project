import {Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "framer-motion";
import {LoadingSpinner} from "@components/LoadingSpinner";

export type InfiniteFetcherParams = {
  isLoading: boolean,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  hasMoreData: boolean,
  setHasMoreData: Dispatch<SetStateAction<boolean>>,
  doUpdate: boolean,
};

export type UseInfiniteScrollProps = {
  fetcher: (params: InfiniteFetcherParams) => Promise<void> | undefined,
  logErrors?: boolean;
  retryAttempts?: number;
  retryTimeout?: number;
  onError?: (err: any) => void;
  onRetryFail?: (err: any) => void;
}

export type InfiniteScrollReturn = [
  boolean,
  () => void,
];

export function useInfiniteScroll({
                                    fetcher,
                                    logErrors = true,
                                    retryAttempts = 3,
                                    retryTimeout = 100,
                                    onError,
                                    onRetryFail
                                  }: UseInfiniteScrollProps): InfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [lastCursor, setLastCursor] = useState<any>(null);
  const [retries, setRetries] = useState<number>(0);

  function shouldRetry() {
    return retries < retryAttempts;
  }

  function onLoad() {
    let doUpdate = true;

    const fetch = () => {
      // @ts-ignore
      fetcher?.({isLoading, setIsLoading, hasMoreData, setHasMoreData, doUpdate})
        .then(cursor => {
          if (doUpdate) {
            if (cursor === lastCursor) {
              // we didn't fetch any data since the cursor is the same
              setRetries(prev => prev + 1)
            } else {
              setIsLoading(false);
              setRetries(0);
            }
            setLastCursor(cursor);
          }
        })
        .catch((err) => {
          onError?.(err);
          if (logErrors) {
            console.error(err);
          }
          if (doUpdate) {
            setRetries(prev => {
              if ((prev + 1) >= retryAttempts) {
                onRetryFail?.(err);
              }
              return prev + 1;
            });
          }
        });
    }

    if (retries > 0) {
      setTimeout(() => {
        fetch();
      }, retryTimeout);
    } else {
      fetch();
    }

    return () => {
      doUpdate = false;
    };
  }

  useEffect(() => {
    if (isLoading) {
      if (shouldRetry()) {
        return onLoad();
      } else {
        setIsLoading(false);
      }
    }
  }, [isLoading, retries]);

  useEffect(() => {
    // reset state
    setIsLoading(false);
    setHasMoreData(true);
    setRetries(0);
  }, [fetcher]);

  function loadData() {
    if (!isLoading && hasMoreData && shouldRetry()) {
      setIsLoading(true);
    }
  }

  return [isLoading, loadData];
}

export interface MaxHeightProps {
  marginBottom: number;
}

export interface InfiniteScrollProps {
  children: ReactNode;
  className?: string;
  containerClass?: string;
  onLoad?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  empty?: ReactNode;
  useMaxHeight?: boolean;
  maxHeightProps?: MaxHeightProps;
}

export default function InfiniteScroll({
                                         children,
                                         className,
                                         containerClass,
                                         onLoad,
                                         isLoading = false,
                                         isEmpty = false,
                                         empty
                                       }: InfiniteScrollProps) {
  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onLoad && containerRef.current) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio <= 0) return;
        if (!isLoading) {
          onLoad();
        }
      });

      if (ref.current) {
        observer.observe(ref.current);
        return () => {
          if (ref.current) observer.unobserve(ref.current);
        }
      }
    }
  }, [ref, containerRef, children, onLoad]);

  const duration = 0.5;

  function getContent() {
    if (!isLoading && isEmpty && empty) {
      return (
        <motion.div initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration}}
        >
          {empty}
        </motion.div>
      )
    }

    return (
      <motion.div initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  transition={{duration}}
                  className={cn("flex flex-col pb-16", containerClass)}
      >
        {children}
        {isLoading &&
          <motion.div className="flex justify-center items-center p-3">
            <LoadingSpinner/>
          </motion.div>
        }
      </motion.div>
    );
  }

  return (
    <div className={className} ref={containerRef}>
      <AnimatePresence mode="wait">
        {getContent()}
      </AnimatePresence>
      <div className="w-0 h-0" ref={ref}/>
    </div>
  )
}