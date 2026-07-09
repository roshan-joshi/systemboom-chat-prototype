import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { Search, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import { Icon } from './Icon'

/* ---------------- Field wrapper ---------------- */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="sb-field">
      {label && (
        <label className="sb-field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span className={cx('sb-field__hint', error && 'sb-field__hint--error')}>
          {error || hint}
        </span>
      )}
    </div>
  )
}

/* ---------------- Text input ---------------- */
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconStart?: LucideIcon
  invalid?: boolean
  trailing?: ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ iconStart, invalid, trailing, className, ...rest }, ref) {
    return (
      <div className={cx('sb-input', invalid && 'sb-input--error', className)}>
        {iconStart && (
          <span className="sb-input__icon">
            <Icon as={iconStart} size="sm" />
          </span>
        )}
        <input ref={ref} className="sb-input__control" {...rest} />
        {trailing}
      </div>
    )
  },
)

/* ---------------- Textarea ---------------- */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ invalid, className, rows = 3, ...rest }, ref) {
  return (
    <div
      className={cx(
        'sb-input sb-input--textarea',
        invalid && 'sb-input--error',
        className,
      )}
    >
      <textarea ref={ref} rows={rows} className="sb-input__control" {...rest} />
    </div>
  )
})

/* ---------------- Search input ---------------- */
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search',
  autoFocus,
  className,
}: {
  value: string
  onChange: (v: string) => void
  onClear?: () => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cx('sb-search', className)} role="search">
      <Icon as={Search} size="sm" />
      <input
        id={id}
        className="sb-search__control"
        type="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="sb-iconbtn sb-iconbtn--sm"
          aria-label="Clear search"
          onClick={() => {
            onChange('')
            onClear?.()
          }}
        >
          <Icon as={X} size="sm" />
        </button>
      )}
    </div>
  )
}
