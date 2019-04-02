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
    // we use Event instead of MouseEvent because onOver and onOut may be
    // passed focus/blur events if you use the handleFocus option
    onOver: (e: Event) => void,
    onOut: (e: Event) => void
  ): HoverIntentHandle

}