import { DOMReceiver, Listenable, createLiveVar } from './live';
import { HoverOptions, createHover } from './Hover';

export interface ListenableHover {
  targetReceiver: DOMReceiver
  isHovered: Listenable<boolean>
}

export function createListenableHover(options?: HoverOptions): ListenableHover {
  const isHovered = createLiveVar(false);
  const hover = createHover(isHovered, options);
  return {
    targetReceiver: hover.targetReceiver,
    isHovered,
  }
}