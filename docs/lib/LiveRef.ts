import { useOnce } from 'lib/hooks';
import { useState, useEffect } from 'react';

/*
  LiveRefs are a useful way for an outer component to pipe a value from one inner component
  to another, without gaining any state.

  You declare a LiveRef with the hook useLiveRef(initialValue).  No state is created.

  You set the value of a LiveRef by calling it like a function.  You can use a
  LiveRef<HTMLElement | null> as a callback ref on a DOM component.

  You get the value of a LiveRef with the hook useLiveRefState(liveRef).  This creates
  component state internally that is automatically updated when the value of the LiveRef
  changes.

  Example:

  function Outer() {
    const valueRef = useLiveRef(''); // no component state is created
    return <div>
      <input type="text" onChange={e => valueRef(e.target.value)}/>
      <Inner valueRef={valueRef}/>
    </div>
  }

  function Inner({valueRef}: {valueRef: LiveRef<string>}) {
    const value = useLiveRefState(valueRef); // creates component state
    return <div>
      {value}
    </div>
  }

  Or even:

  function Outer() {
    const valueRef = useLiveRef(''); // no component state is created
    // Inner component has the state.
    // When nesting a component like this, useMemo or useOnce is a good idea.
    const Inner = useOnce(() => function() {
      const value = useLiveRefState(valueRef);
      return <div>{value}</div>
    });
    return <div>
      <input type="text" onChange={e => valueRef(e.target.value)}/>
      <Inner/>
    </div>
  }

*/

export interface Callback<T> {
  (newValue: T): void
}

export interface DOMCallback extends Callback<HTMLElement | null> {}

export interface LiveRef<T> extends Callback<T> {
  _current: T
  _listeners: Set<(newValue: T) => void>
}

export interface DOMLiveRef extends LiveRef<HTMLElement | null> {}

export function useLiveRef<T>(initialValue: T | (() => T)): LiveRef<T> {
  return useOnce(() => {
    const ref = (newValue: T) => {
      ref._current = newValue;
      ref._listeners.forEach(L => L(newValue));
    }
    ref._current = (typeof initialValue === 'function') ? (initialValue as any)() : initialValue;
    ref._listeners = new Set()
    return ref;
  });
}

export function useLiveRefState<T>(liveRef: LiveRef<T>): T {
  const [value, setValue] = useState(liveRef._current);
  useEffect(() => {
    setValue(liveRef._current); // catch any changes since render time
    liveRef._listeners.add(setValue);
    return () => { liveRef._listeners.delete(setValue) };
  }, [liveRef]);
  return value;
}
