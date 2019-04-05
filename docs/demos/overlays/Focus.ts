import { DOMReceiver, Receiver } from 'lib/live'

export interface Focus {
  targetElement: DOMReceiver
}

// https://github.com/facebook/react/issues/6410
// https://github.com/facebook/react/issues/11405
// https://github.com/Microsoft/TSJS-lib-generator/pull/369
// https://reactjs.org/docs/accessibility.html#mouse-and-pointer-events

export function createFocus(setIsFocusWithin: Receiver<boolean>): Focus {
  let element: HTMLElement | null = null
  let focusIsWithin = false
  let focusOutCheckTimer: ReturnType<typeof setTimeout> | undefined

  function onFocusIn(this: HTMLElement, e: FocusEvent) {
    clearTimeout(focusOutCheckTimer)
    focusOutCheckTimer = undefined
    if (!focusIsWithin) {
      focusIsWithin = true
      setIsFocusWithin(true)
    }
  }
  function onFocusOut(this: HTMLElement, e: FocusEvent) {
    if (!focusOutCheckTimer) {
      focusOutCheckTimer = setTimeout(() => {
        focusOutCheckTimer = undefined
        const newFocusIsWithin = element
          ? element.contains(document.activeElement)
          : false
        if (focusIsWithin && !newFocusIsWithin) {
          focusIsWithin = false
          setIsFocusWithin(focusIsWithin)
        }
      }, 0)
    }
  }

  const targetElement = (newElement: HTMLElement | null) => {
    if (newElement === element) {
      return
    }
    if (element) {
      element.removeEventListener('focusin' as 'focus', onFocusIn, false)
      element.removeEventListener('focusout' as 'blur', onFocusOut, false)
    }
    element = newElement
    if (element) {
      element.addEventListener('focusin' as 'focus', onFocusIn, false)
      element.addEventListener('focusout' as 'blur', onFocusOut, false)
    }
  }
  return { targetElement }
}
