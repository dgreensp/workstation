import React from 'react'
import ReactDOM from 'react-dom'
import { useLiveVar, useListen } from 'lib/live'

function App() {
  const input = useLiveVar(() => '')
  const inputValue = useListen(input)

  return (
    <main role="main" className="container mt-5">
      <div className="row">
        <div className="col-sm colLeft">
          <div className="px-3 pt-4">
            <div className="inputWrapper">
              <textarea
                className="form-control text-monospace input"
                value={inputValue}
                onChange={e => input(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="col-sm colRight">
          <div className="px-3 pt-4">
            <pre>
              <code>{inputValue}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
