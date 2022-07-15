import { createFocusTrap, Options } from 'focus-trap'
import { MutableRefObject, useEffect } from 'react'

export default function useFocusTrap(
  ref: MutableRefObject<HTMLElement | null> | null | undefined | false,
  focusTrapOptions?: Options
) {
  useEffect(() => {
    if (!ref || !ref.current) return

    const trap = createFocusTrap(ref.current, focusTrapOptions)
    trap.activate()

    return () => {
      trap.deactivate()
    }
  }, [ref, focusTrapOptions])
}
