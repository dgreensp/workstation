import React from 'react';
import ReactDOM from 'react-dom';
import * as DOMHooks from 'lib/DOMHooks';

function App() {
  return <div style={{
    height: '100vh',
    display: 'flex',
  }}>
    <div style={{
      background: '#ddd',
      flex: 1,
      margin: '20px',
      position: 'relative',
    }}>
      <Surface/>
    </div>
  </div>
}

function Surface() {
  const ref: React.RefObject<HTMLDivElement> = React.useRef(null);
  const { width, height } = DOMHooks.useSize(ref);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect()
    console.log(e.clientX, e.clientY, rect.left, rect.top);
  }, []);

  React.useLayoutEffect(() => {
    if (ref.current && getComputedStyle(ref.current.parentElement!).position !== 'relative') {
      throw new Error('Surface parent element must have position: relative')
    }
  }, [])

  return <div ref={ref} style={{
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }} onMouseDown={handleMouseDown}>

  </div>
}

const root = document.getElementById('root');
ReactDOM.render(<App/>, root);