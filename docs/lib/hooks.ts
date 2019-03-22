import { useCallback, useRef } from 'react';

// This module is for utility hooks that are of totally general use.

// Create a memoized callback that calls all the given callbacks.
// Example:
// const onClick = useAllCallbacks(handleClick1, handleClick2)
// const ref = useAllCallbacks(ref1, ref2)
export function useAllCallbacks<A extends any[], T extends (...args: A) => void>(...callbacks: T[]): T {
  return useCallback(((...args: A) => {
    callbacks.forEach(cb => cb(...args));
  }) as any, callbacks);
}

// useOnce runs some code only on first render and remembers the result.  It's like
// useMemo(() => ..., []), except technically useMemo is a performance optimization
// and doesn't guarantee it won't recalculate the value.
export function useOnce<T>(compute: () => T): T {
  // wrap the value in an object in case "undefined" is a valid value of type T
  const ref = useRef<{result: T}>();
  if (!ref.current) {
    ref.current = { result: compute() };
  }
  return ref.current.result;
}

// TODO: document
export function useComputingWrapper<Arg, Props = {}>(func: (props: Props) => Arg) {
  return useOnce(() => function (props: Props & { children: (arg: Arg) => React.ReactElement | null }) {
    return props.children(func(props));
  });
}