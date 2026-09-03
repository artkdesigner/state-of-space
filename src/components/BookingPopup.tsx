import { useEffect, useState } from 'react'
import { getLenis } from '../lib/scroll'

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M4 4L36 36M36 4L4 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CtaArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M8 32L32 8M32 8H12M32 8V28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type BookingPopupProps = {
  open: boolean
  onClose: () => void
}

const TRANSITION_MS = 500

export default function BookingPopup({ open, onClose }: BookingPopupProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      )
      return () => cancelAnimationFrame(raf)
    }

    setVisible(false)
    const timeout = setTimeout(() => setMounted(false), TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!mounted) return

    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()

    return () => {
      document.documentElement.style.overflow = ''
      getLenis()?.start()
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div
      className="Popup fixed inset-0 z-100"
      role="dialog"
      aria-modal="true"
      aria-label="Booking form"
    >
      <div
        className={`Popup-backdrop absolute inset-0 hidden bg-[rgba(0,0,0,0.7)] transition-opacity duration-500 md:block lg:backdrop-blur-[1.25rem] ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="Popup-inner relative flex size-full items-stretch">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="Popup-close relative hidden flex-1 cursor-pointer text-light md:block"
        >
          <CloseIcon className="absolute bottom-5 left-5 size-20 lg:bottom-14.75 lg:left-9.75 lg:size-25.75" />
        </button>

        <div
          className={`Popup-body relative flex h-full w-full shrink-0 flex-col items-start justify-between gap-10 overflow-y-auto bg-light p-2.5 text-dark transition-transform duration-500 ease-out md:w-125 md:p-5 lg:w-322.5 lg:gap-20 lg:p-10 ${
            visible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="Popup-close-mobile absolute right-2.5 top-2.5 flex size-15 cursor-pointer items-center justify-center md:hidden"
          >
            <CloseIcon className="size-10" />
          </button>

          <div className="Popup-form-wrap flex w-full flex-col items-start gap-10 lg:gap-20">
            <div className="Popup-form-top flex w-full flex-col items-start gap-5 lg:flex-row lg:items-start lg:gap-10">
              <h2 className="font-manrope text-[3rem] font-semibold leading-none tracking-[-0.04em] text-dark/60 md:text-[6rem] lg:flex-1 lg:text-[8.375rem] lg:tracking-[-0.06em]">
                Get
                <br />
                in touch
              </h2>
              <p className="font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] lg:w-77.5 lg:text-[1.125rem]">
                Ready to book the villa of your dreams?
                <br />
                {`Get in touch! We'll get back to you quickly and assist with
                selecting dates and arranging every detail.`}
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="Popup-form flex w-full flex-col items-start gap-5 lg:gap-10"
            >
              {['Name', 'Phone', 'Message'].map((field) => (
                <label
                  key={field}
                  className="Popup-input flex w-full items-center border-b border-dark/30 pb-5 font-manrope text-[0.875rem] font-medium tracking-[-0.01em] lg:pb-5 lg:text-[1.125rem]"
                >
                  <span className="sr-only">{field}</span>
                  <input
                    type={field === 'Phone' ? 'tel' : 'text'}
                    placeholder={field}
                    className="w-full bg-transparent text-dark placeholder:text-dark/60 focus:outline-none"
                  />
                </label>
              ))}

              <label className="Popup-checkbox flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-[0.375rem] border border-dark/30 bg-light lg:size-6"
                />
                <span className="font-manrope text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] lg:text-[1.125rem]">
                  I agree with the
                  <br />
                  privacy policy
                </span>
              </label>
            </form>
          </div>

          <div className="Popup-cta flex w-full items-center justify-between">
            <button
              type="submit"
              className="Popup-cta-title cursor-pointer whitespace-nowrap font-manrope text-[2.125rem] font-semibold leading-none tracking-[-0.06em] text-dark md:text-[4.1875rem] lg:text-[8.375rem]"
            >
              Apply Now
            </button>
            <CtaArrowIcon className="size-10.5 shrink-0 md:size-[5.2303rem] lg:size-[8.7172rem]" />
          </div>
        </div>
      </div>
    </div>
  )
}
