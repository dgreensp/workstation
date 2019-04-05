import React, { useCallback, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { Alert } from 'reactstrap'
import { OverlayManager, OverlayPortal } from './OverlayPortal'
import { useOnce, createLiveVar, Listen } from 'lib/live'
import { createHoverPopover } from './HoverPopover'

function App() {
  const MyHoverPopover1 = useOnce(() => createHoverPopover())
  const MyHoverPopover2 = useOnce(() => createHoverPopover())
  return (
    <OverlayManager>
      <main role="main" className="container mt-5">
        <h1>Hello, Reactstrap!</h1>
        <Alert color="primary" innerRef={MyHoverPopover1.triggerElement}>
          This is a primary alert — check it out!
          <OverlayPortal level={1000}>
            <div style={{ position: 'absolute', top: 0 }}>Hello</div>
          </OverlayPortal>
          <OverlayPortal level={3000}>
            <div style={{ position: 'absolute', top: 100 }}>Hello 3</div>
          </OverlayPortal>
          <OverlayPortal level={2000} exclusive>
            <div style={{ position: 'absolute', top: 200 }}>Hello 2</div>
          </OverlayPortal>
          <OverlayPortal level={2000} exclusive>
            <div style={{ position: 'absolute', top: 300 }}>Hello 4</div>
          </OverlayPortal>
        </Alert>
        <MyHoverPopover1>
          <div style={{ fontSize: 36, background: 'red' }}>Hello!</div>
        </MyHoverPopover1>
        <Alert color="primary" innerRef={MyHoverPopover2.triggerElement}>
          This is a primary alert — check it out!
        </Alert>
        <MyHoverPopover2>
          <div style={{ fontSize: 36, background: 'green' }}>World!</div>
        </MyHoverPopover2>
        <DropdownButton />
      </main>
    </OverlayManager>
  )
}

function DropdownButton() {
  const isTriggerFocused = useOnce(() => createLiveVar(false))
  const isOverlayFocused = useOnce(() => createLiveVar(false))
  const onFocusTrigger = useCallback(() => isTriggerFocused(true), [])
  const onBlurTrigger = useCallback(e => {
    isTriggerFocused(false)
    console.log(e.relatedTarget)
  }, [])
  const onFocusInDropdown = useCallback(() => isOverlayFocused(true), [])
  const onFocusOutDropdown = useCallback(() => isOverlayFocused(false), [])
  return (
    <>
      <div
        className="myDropdownButton"
        tabIndex={0}
        onFocus={onFocusTrigger}
        onBlur={onBlurTrigger}
      >
        Dropdown
      </div>
      <Listen to={{ isTriggerFocused, isOverlayFocused }}>
        {({ isTriggerFocused, isOverlayFocused }) =>
          isTriggerFocused || isOverlayFocused ? (
            <OverlayPortal level={999}>
              <div
                onFocus={onFocusInDropdown}
                onBlur={onFocusOutDropdown}
                tabIndex={0}
                className="myDropdownMenu"
              >
                Dropdown
              </div>
            </OverlayPortal>
          ) : null
        }
      </Listen>
    </>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
