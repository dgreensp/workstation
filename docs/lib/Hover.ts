import hoverintent, { HoverIntentOptions } from 'hoverintent';
import { DOMReceiver } from './live';

export interface HoverOptions {
  intent?: boolean | HoverIntentOptions
}

export interface Hover {
  targetElement: DOMReceiver
}

// This function returns a callback ref that will correctly set up and tear down the "hoverintent" package
// when the element mounts and unmounts.
// 
// For options.intent you can pass:
// - `false` for plain hover with no intent (the default)
// - `true` for default hover intent
// - an object with options to pass to the "hoverintent" package
export function createHover(setIsHovered: (isHovered: boolean) => void, options: HoverOptions = {}): Hover {
  let element: HTMLElement | null = null;
  let handle: ReturnType<typeof hoverintent> | null = null;
  const onOver = () => setIsHovered(true);
  const onOut = () => setIsHovered(false);
  const targetElement = (newElement: HTMLElement | null) => {
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
        handle.options({ sensitivity: Infinity, interval: 0 });
      } else if (typeof intent === 'object') {
        handle.options(intent);
      }
    }
  }
  return { targetElement };
}
