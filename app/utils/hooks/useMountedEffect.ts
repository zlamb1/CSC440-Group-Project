import {useEffect, useRef} from "react";

export default function useMountedEffect(fn: () => (() => void) | void, dependencies?: any[]) {
  const hasMounted = useRef<boolean>(false);

  useEffect(() => {
    if (hasMounted.current) {
      return fn();
    } else hasMounted.current = true;
  }, dependencies);
}