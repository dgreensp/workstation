import React, { ReactNode, useCallback } from 'react'

export interface EventStopperProps {
  children?: ReactNode
}

// Stop all React event propagation.  See https://github.com/facebook/react/issues/11387#issuecomment-355395803

export function EventStopper({ children }: EventStopperProps) {
  const stopPropagation = useCallback(e => e.stopPropagation(), [])
  return (
    <div
      onClick={stopPropagation}
      onContextMenu={stopPropagation}
      onDoubleClick={stopPropagation}
      onDrag={stopPropagation}
      onDragEnd={stopPropagation}
      onDragEnter={stopPropagation}
      onDragExit={stopPropagation}
      onDragLeave={stopPropagation}
      onDragOver={stopPropagation}
      onDragStart={stopPropagation}
      onDrop={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseEnter={stopPropagation}
      onMouseLeave={stopPropagation}
      onMouseMove={stopPropagation}
      onMouseOver={stopPropagation}
      onMouseOut={stopPropagation}
      onMouseUp={stopPropagation}
      onKeyDown={stopPropagation}
      onKeyPress={stopPropagation}
      onKeyUp={stopPropagation}
      onFocus={stopPropagation}
      onBlur={stopPropagation}
      onChange={stopPropagation}
      onInput={stopPropagation}
      onInvalid={stopPropagation}
      onSubmit={stopPropagation}
    >
      {children}
    </div>
  )
}
