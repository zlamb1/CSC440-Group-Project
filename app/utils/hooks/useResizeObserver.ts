import {RefObject, useEffect, useState} from "react";

type Dimensions = {
  width: number;
  height: number;
};

type BoundingRect = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 *
 * @return Dimensions - without padding
 * @return BoundingRect - dimensions with padding as well as left, right, top, and bottom
 */

export default function useResizeObserver<T extends HTMLElement>(options?: {
  ref: RefObject<T | undefined> | HTMLElement
}): [Dimensions, BoundingRect] {
  const [dimensions, setDimensions] = useState({width: 0, height: 0});
  const [boundingRect, setBoundingRect] = useState({width: 0, height: 0, left: 0, right: 0, top: 0, bottom: 0});

  useEffect(() => {
    const ref = options?.ref ?? document.body;
    const element: Element | null | undefined = 'current' in ref ? ref.current : ref;

    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;

      if (element) {
        const _boundingRect = element.getBoundingClientRect();
        const left = _boundingRect.left, right = _boundingRect.right, top = _boundingRect.top,
          bottom = _boundingRect.bottom;
        if (boundingRect?.left !== left || boundingRect?.right !== right || boundingRect?.top !== top || boundingRect?.bottom !== bottom) {
          setBoundingRect({
            width: right - left, height: bottom - top,
            left, right, top, bottom
          });
        }
      }

      const entry = entries[0];
      if (entry && (dimensions?.width !== entry.contentRect.width || dimensions?.height !== entry.contentRect.height)) {
        if (dimensions?.width !== entry.contentRect.width || dimensions?.height !== entry.contentRect.height) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      if (element) resizeObserver.unobserve(element);
    };
  });

  return [dimensions, boundingRect];
}