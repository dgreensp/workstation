import hoverintent, { HoverIntentOptions } from 'hoverintent';
import { Receiver } from './live';

export interface HoverOptions {
  intent?: boolean | HoverIntentOptions
}

export interface Hover {
  targetReceiver: Receiver<HTMLElement | null>
}

// This function returns a callback ref that will correctly set up and tear down the "hoverintent" package
// when the element mounts and unmounts.
// 
// For "options" you can pass:
// - `false` for plain hover with no intent
// - `true` for default hover intent
// - an object with options to pass to the "hoverintent" package
export function createHover(setHovered: (hovered: boolean) => void, options: HoverOptions = {}): Hover {
  let element: HTMLElement | null = null;
  let handle: ReturnType<typeof hoverintent> | null = null;
  const onOver = () => setHovered(true);
  const onOut = () => setHovered(false);
  const targetReceiver = (newElement: HTMLElement | null) => {
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
  return { targetReceiver };
}
