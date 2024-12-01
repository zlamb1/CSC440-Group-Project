import {useEffect, useState} from "react";

let isHydrating = true;

export default function useIsSSR() {
  const [isSSR, setIsSSR] = useState(isHydrating);
  useEffect(() => {
    isHydrating = false;
    setIsSSR(false);
  }, []);
  return isSSR;
}