import React, { useCallback, useRef } from 'react'
import ReactDOM from 'react-dom'
import { OverlayManager, OverlayPortal } from './OverlayPortal'
import { useOnce, createLiveVar, Listen, Receiver } from 'lib/live'
import { createFocus } from './Focus'

function App() {
  return (
    <OverlayManager>
      <div className="buttonContainer">
        <MenuButton name="Apples" />
        <MenuButton name="Banana" />
      </div>
    </OverlayManager>
  )
}

type x = Exclude<number | undefined, null | undefined>

interface Waiter<T = true> extends Receiver<T | null | undefined | false> {
  get(): Promise<T>
}

function createWaiter<T = true>(): Waiter<T> {
  let resolve: Receiver<T>
  let promise: Promise<T> = new Promise(r => {
    resolve = r
  })
  const waiter: Waiter<T> = newValue => {
    if (newValue === null || newValue === undefined || newValue === false) {
      promise = new Promise(r => {
        resolve = r
      })
    } else {
      resolve(newValue)
    }
  }
  waiter.get = () => promise
  return waiter
}

function MenuButton({ name }: { name: string }) {
  const {
    isMenuOpen,
    firstMenuItemWaiter,
    onClickButton,
    menuFocus,
    menuButton,
  } = useOnce(() => {
    const isMenuOpen = createLiveVar(false)
    const firstMenuItemWaiter = createWaiter<HTMLElement>()
    const menuBlurWaiter = createWaiter()
    const menuFocus = createFocus(f => menuBlurWaiter(!f))
    const onClickButton = async () => {
      isMenuOpen(true)
      const toFocus = await firstMenuItemWaiter.get()
      toFocus.focus()
      await menuBlurWaiter.get()
      isMenuOpen(false)
    }
    const menuButton = useRef<HTMLButtonElement>(null)
    return { isMenuOpen, firstMenuItemWaiter, onClickButton, menuFocus, menuButton }
  })

  return (
    <>
      <button
        onClick={onClickButton}
        aria-haspopup={true}
        aria-expanded={false}
        ref={menuButton}
      >
        {name}
      </button>
      <Listen to={{ isMenuOpen }}>
        {({ isMenuOpen }) =>
          isMenuOpen && (
            <OverlayPortal level={1000} exclusive>
              <div role="menu" ref={menuFocus.targetElement}>
                <button
                  className="menuItem"
                  role="menuitem"
                  tabIndex={-1}
                  ref={firstMenuItemWaiter}
                >
                  {name} Item 1
                </button>
                <button className="menuItem" role="menuitem" tabIndex={-1}>
                  {name} Item 2
                </button>
                <button className="menuItem" role="menuitem" tabIndex={-1}>
                  {name} Item 3
                </button>
              </div>
            </OverlayPortal>
          )
        }
      </Listen>
    </>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
