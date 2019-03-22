import React from 'react';
import ReactDOM from 'react-dom';
import * as DOMHooks from 'lib/DOMHooks';

function App() {
  const ref: React.RefObject<HTMLDivElement> = React.useRef(null);
  const { width, height } = DOMHooks.useSize(ref);
  const dpr = DOMHooks.useDevicePixelRatio();

  return <div ref={ref} style={{
    background: 'blue',
    height: '100vh',
  }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '50%', background: 'red' }}></div>
    <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50%', height: '50%', background: 'purple' }}></div>
    <div style={{
      position: 'absolute',
      left: 0, right: 0, top: 0, bottom: 0,
      display: 'flex',
   }}>
      <div style={{
        fontSize: 36,
        color: 'white',
        margin: 'auto',
      }}>
        <div>width: {width}</div>
        <div>height: {height}</div>
        <div>devicePixelRatio: {dpr}</div>
      </div>
    </div>
    <div style={{
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
      background: '#ddd',
      padding: 10,
    }}>
      This demo demonstrates a full-window div whose size is efficiently watched.  Try resizing the window,
      and also zooming (Command-Minus, Command-Equals on a Mac).
    </div>
  </div>
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);