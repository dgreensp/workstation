import { DOMReceiver, Receiver } from 'lib/live'

export interface Focus {
  targetElement: DOMReceiver
}

// https://github.com/facebook/react/issues/6410
// https://github.com/facebook/react/issues/11405
// https://github.com/Microsoft/TSJS-lib-generator/pull/369

export function createFocus(setIsFocusWithin: Receiver<boolean>, DEBUG: string): Focus {
  let element: HTMLElement | null = null
  let focusIsWithin = false
  let focusOutCheckTimer: ReturnType<typeof setTimeout> | undefined

  function focusOutCheck() {
    const newFocusIsWithin = element ? element.contains(document.activeElement) : false
    if (focusIsWithin && !newFocusIsWithin) {
      focusIsWithin = false
      setIsFocusWithin(focusIsWithin)
    }
  }

  function scheduleFocusOutCheck() {
    if (!focusOutCheckTimer) {
      focusOutCheckTimer = setTimeout(() => {
        focusOutCheckTimer = undefined
        focusOutCheck()
      }, 0)
    }
  }

  function clearFocusOutCheck() {
    if (focusOutCheckTimer) {
      clearTimeout(focusOutCheckTimer)
      focusOutCheckTimer = undefined
    }
  }

  function onFocusIn(this: HTMLElement, e: FocusEvent) {
    clearFocusOutCheck()
    if (!focusIsWithin) {
      focusIsWithin = true
      setIsFocusWithin(true)
    }
  }
  function onFocusOut(this: HTMLElement, e: FocusEvent) {
    console.log(e.relatedTarget)
    scheduleFocusOutCheck()
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
