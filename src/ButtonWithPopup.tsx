import { ReactNode } from 'react'

import useOpenPopup, { PopupComponent, PopupExternalProps, PopupInternalProps } from '.'

export default function ButtonWithPopup<P extends PopupInternalProps>({
  className,
  children,
  renderPopup,
  popupProps
}: {
  className?: string
  children: ReactNode
  renderPopup: PopupComponent<P>
} & (keyof PopupExternalProps<P> extends never ? { popupProps?: never } : { popupProps: PopupExternalProps<P> })) {
  const openPopup = useOpenPopup(renderPopup)

  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()

        openPopup(popupProps as PopupExternalProps<P>)
      }}
      className={className}
    >
      {children}
    </button>
  )
}
