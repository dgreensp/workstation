import React from 'react';
import ResizeSensor from 'ResizeSensor';

export function useDevicePixelRatio() {
  const [dpr, setDPR] = React.useState(window.devicePixelRatio);
  React.useEffect(() => {
    const onResize = () => {
      setDPR(window.devicePixelRatio);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [])
  return dpr;
}

export function useSize(ref: React.RefObject<HTMLElement>) {
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    function update() {
      if (!ref.current) return;
      const newRect = ref.current.getBoundingClientRect();
      setWidth(newRect.width);
      setHeight(newRect.height);
    }
    update();
    // TODO: bind this in a way that it doesn't get recreated every time,
    // and test/demo it properly
    const sensor = new ResizeSensor(ref.current, update);
    return () => sensor.detach();
  });
  return { width, height };
}