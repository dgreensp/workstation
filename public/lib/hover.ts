import { useRef } from 'react'
import { useOnce } from 'lib/hooks'
import hoverintent, { HoverIntentOptions } from 'hoverintent';

type DOMCallback = (el: HTMLElement | null) => void

export interface HoverOptions {
  intent?: boolean | HoverIntentOptions
}

// This function returns a callback ref that will correctly set up and tear down the "hoverintent" package
// when the element mounts and unmounts.
// 
// For "options" you can pass:
// - `false` for plain hover with no intent
// - `true` for default hover intent
// - an object with options to pass to the "hoverintent" package
export function getHoverRef(setHovered: (hovered: boolean) => void, options: HoverOptions = {}): DOMCallback {
  let element: HTMLElement | null = null;
  let handle: ReturnType<typeof hoverintent> | null = null;
  const onOver = () => setHovered(true);
  const onOut = () => setHovered(false);
  return (newElement: HTMLElement | null) => {
    if (newElement === element) {
      return;
    }
    element = newElement;
    if (handle) {
      handle.remove();
      handle = null;
    }
    if (element) {
      handle = hoverintent(element, onOver, onOut);
      const { intent = false } = options;
      if (intent === false) {
        handle.options({ sensitivity: Infinity });
      } else if (typeof intent === 'object') {
        handle.options(intent);
      }
    }
  }
}

// This hook returns a memoized callback ref that you can put on an element to get called when its
// hover state changes.  By default, no hover intent is used, but you can pass `true` or an options
// object to the "intent" option to enable hover intent.
export function useHover(setHovered: (hovered: boolean) => void, options: HoverOptions = {}): DOMCallback {
  return useOnce(() => getHoverRef(setHovered, options));
}
