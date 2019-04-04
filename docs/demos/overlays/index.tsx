import React from 'react'
import ReactDOM from 'react-dom'
import { Alert } from 'reactstrap'
import { OverlayManager, useOverlay } from './Overlay'

function App() {
  return (
    <OverlayManager>
      <main role="main" className="container mt-5">
        <h1>Hello, Reactstrap!</h1>
        <Alert color="primary">This is a primary alert — check it out!</Alert>
      </main>
    </OverlayManager>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
