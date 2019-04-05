import { useRef, useState, useEffect } from 'react'
import { Receiver } from './Receiver'
import { Listenable } from './Listenable'

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

/* don't use this, instead just write this because it's more explicit:
  useOnce(() => createLiveVar(...))
export function useLiveVar<T>(initialValue: () => T): LiveVar<T> {
  return useOnce(() => createLiveVar(initialValue()))
}*/

export function useListen<T>(v: Listenable<T>): T {
  const [, setState] = useState<T>(() => v.peek())
  useEffect(() => {
    v.listen(setState)
    return () => {
      v.unlisten(setState)
    }
  }, [v])
  return v.peek()
}
