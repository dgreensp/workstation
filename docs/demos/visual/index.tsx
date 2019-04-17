import React from 'react'
import ReactDOM from 'react-dom'
import { Alert } from 'reactstrap'

function App() {
  return (
    <main role="main" className="container mt-5">
      <div className="container">
        <div className="item item1">
          <div className="front">Apple</div>
          <div className="back" />
        </div>
        <div className="item item2">
          <div className="front">Banana</div>
          <div className="back" />
        </div>
      </div>
    </main>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
