import React from 'react'
import ReactDOM from 'react-dom'
import { Alert } from 'reactstrap'
import { OverlayManager, OverlayPortal } from './OverlayPortal'
import { useOnce } from 'lib/live'
import { createHoverPopover } from './HoverPopover'

function App() {
  const MyHoverPopover = useOnce(() => createHoverPopover())
  return (
    <OverlayManager>
      <main role="main" className="container mt-5">
        <h1>Hello, Reactstrap!</h1>
        <Alert color="primary" innerRef={MyHoverPopover.triggerElement}>
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
        <MyHoverPopover>
          <div style={{ fontSize: 36, background: 'red' }}>Hello!</div>
        </MyHoverPopover>
        <div style={{ position: 'absolute', bottom: 0, right: 0 }} />
      </main>
    </OverlayManager>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
