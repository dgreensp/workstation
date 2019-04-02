import { useRef, useState } from 'react'
import { Receiver } from './Receiver'
import { LiveVar, createLiveVar } from './LiveVar'

// useOnce runs some code only on first render and remembers the result.  It's like
// useMemo(() => ..., []), except technically useMemo is a performance optimization
// and doesn't guarantee it won't recalculate the value.
export function useOnce<T>(compute: () => T): T {
  // wrap the value in an object in case "undefined" is a valid value of type T
  const ref = useRef<{ result: T }>()
  if (!ref.current) {
    ref.current = { result: compute() }
  }
  return ref.current.result
}

export function useLiveVar<T>(initialValue: () => T): LiveVar<T> {
  return useOnce(() => createLiveVar(initialValue()))
}

export function useListen<T>(v: LiveVar<T>): T {
  const [state, setState] = useState<T>()
  const ref = useRef<{ lastVar: LiveVar<T>; receiver: Receiver<T> }>()
  if (ref.current) {
    const { lastVar, receiver } = ref.current
    if (lastVar === v) {
      return state!
    }
    lastVar.unlisten(receiver)
    ref.current.lastVar = v
  } else {
    ref.current = { lastVar: v, receiver: setState }
  }
  const value = v.peek()
  setState(value)
  v.listen(ref.current.receiver)
  return value
}
