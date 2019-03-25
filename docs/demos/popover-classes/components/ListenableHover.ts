import { DOMReceiver, Listenable, createLiveVar } from '../live';
import { HoverOptions, createHover } from './Hover';

export interface ListenableHover {
  targetElement: DOMReceiver
  isHovered: Listenable<boolean>
}

export function createListenableHover(options?: HoverOptions): ListenableHover {
  const isHovered = createLiveVar(false);
  const hover = createHover(isHovered, options);
  return {
    targetElement: hover.targetElement,
    isHovered,
  }
}