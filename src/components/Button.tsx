import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'dark' | 'light'
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  dark: 'bg-dark text-light',
  light: 'bg-light text-dark',
}

export default function Button({
  variant = 'dark',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`Button inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[1.75rem] px-5 py-3.25 font-manrope text-[0.875rem] font-medium tracking-[-0.03em] md:px-5.5 md:py-4.25 md:text-[1rem] md:tracking-[-0.01em] ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
