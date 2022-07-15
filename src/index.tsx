import classNames from 'classnames'
import { createContext, FC, useCallback, useContext, useMemo, useRef, useState, ComponentClass, ReactNode } from 'react'
import 'tailwindcss/tailwind.css'

import styles from './index.module.scss'
import useFocusTrap from './useFocusTrap'

export type PopupInternalProps = { handleClose: () => void }
export type PopupExternalProps<P extends PopupInternalProps> = Omit<P, keyof PopupInternalProps>
export type PopupComponent<P extends PopupInternalProps> = FC<P> | ComponentClass<P>
type PopupDetails<P extends PopupInternalProps = PopupInternalProps> = {
  Popup: PopupComponent<P>
  props?: P
  fadeOut?: true
}
type ShowFn<P extends PopupInternalProps> = (Popup: PopupComponent<P>, props?: PopupExternalProps<P>) => void
export type HasExternalProps<P extends PopupInternalProps> = keyof PopupExternalProps<P> extends never ? true : false

const popupContext = createContext<ShowFn<PopupInternalProps>>(() => {})

function PopupContainer({
  popup: { Popup, props, fadeOut },
  hide,
  showBg
}: {
  popup: PopupDetails
  hide: () => void
  showBg: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useFocusTrap(showBg && ref, {
    fallbackFocus: ref.current || undefined,
    initialFocus: () =>
      // (ref.current?.querySelector('[data-initialfocus]') as HTMLElement) ||
      (ref.current?.querySelector('input:not([tabindex="-1"])') as HTMLElement) || ref.current,
    escapeDeactivates: false,
    allowOutsideClick: true
  })

  return (
    <div
      className={classNames(
        styles.PopupContainer,
        fadeOut ? styles.FadeOut : styles.FadeIn,
        'uop-fixed uop-inset-0 uop-flex uop-items-center uop-z-10',
        showBg && 'uop-bg-black uop-bg-opacity-40'
      )}
      onClick={
        fadeOut
          ? undefined
          : e => {
              e.stopPropagation()
              hide()
            }
      }
    >
      <div
        className={classNames(
          styles.PopupScrollContainer,
          'uop-max-h-screen uop-p-5 uop-w-full uop-text-center',
          showBg ? 'uop-overflow-y-auto' : 'uop-overflow-y-hidden'
        )}
      >
        <div
          className="uop-mx-auto uop-text-left uop-inline-block uop-outline-none"
          onClick={e => {
            e.stopPropagation()
          }}
          onKeyDown={
            fadeOut
              ? undefined
              : e => {
                  if (e.key === 'Escape') hide()
                }
          }
          ref={ref}
          tabIndex={-1}
        >
          <Popup {...props} handleClose={fadeOut ? () => {} : hide} />
        </div>
      </div>
    </div>
  )
}

const TRANSITION_DURATION = 300

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<PopupDetails[]>([])

  const show = useCallback(<P extends PopupInternalProps>(Popup: PopupComponent<P>, props?: PopupExternalProps<P>) => {
    setPopups(s => [...s, { Popup, props } as PopupDetails])
  }, [])

  const hide = useCallback((index: number) => {
    setPopups(popups => {
      if (popups[index]) popups[index] = { ...popups[index], fadeOut: true }
      return [...popups]
    })
    setTimeout(() => {
      setPopups(popups => {
        popups.splice(index, 1)
        return [...popups]
      })
    }, TRANSITION_DURATION)
  }, [])

  const lastActivePopupIndex = useMemo(() => {
    for (let i = popups.length - 1; i >= 0; i--) if (!popups[i].fadeOut) return i

    return -1
  }, [popups])

  return (
    <popupContext.Provider value={show}>
      {popups.map((popup, index) => (
        <PopupContainer key={index} popup={popup} hide={() => hide(index)} showBg={index === lastActivePopupIndex} />
      ))}
      {children}
    </popupContext.Provider>
  )
}

export default function useOpenPopup<P extends PopupInternalProps>(PopupComp: PopupComponent<P>) {
  const ctx = useContext(popupContext)

  const openPopup = (props?: PopupExternalProps<P>) => {
    ctx(PopupComp as PopupComponent<PopupInternalProps>, props)
  }

  return openPopup as keyof PopupExternalProps<P> extends never
    ? (props?: PopupExternalProps<P> | null) => void
    : (props: PopupExternalProps<P>) => void
}

export { default as ButtonWithPopup } from './ButtonWithPopup'
