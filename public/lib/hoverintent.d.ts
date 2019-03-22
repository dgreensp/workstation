declare module "hoverintent" {

  export interface HoverIntentOptions {
    sensitivity?: number
    interval?: number
    timeout?: number
    handleFocus?: boolean
  }

  export interface HoverIntentHandle {
    remove: () => void
    options: (opts: HoverIntentOptions) => HoverIntentHandle
  }

  export default function hoverintent(
    el: HTMLElement,
    // technically, onOver and onOut are passed the Event that caused them,
    // but it's not clear how useful these events are.  they aren't necessarily
    // MouseEvents, because hoverintent can be configured to listen to focus
    // and blur as well.
    onOver: () => void,
    onOut: () => void
  ): HoverIntentHandle

}