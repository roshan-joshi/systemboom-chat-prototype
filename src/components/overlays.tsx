import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'
import { useEscapeKey, useFocusTrap, useScrollLock } from '@/lib/hooks'
import { Icon } from './Icon'
import { Button, IconButton } from './primitives'

/* Overlays portal into the frame-level overlay root so they position against the
   device frame (staying within it on desktop) rather than the scrolling content. */
function OverlayPortal({ children }: { children: ReactNode }) {
  const target =
    (typeof document !== 'undefined' && document.getElementById('sb-overlay-root')) ||
    (typeof document !== 'undefined' ? document.body : null)
  if (!target) return null
  return createPortal(children, target)
}

/* ---------------- Bottom Sheet ---------------- */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
}) {
  useEscapeKey(onClose, open)
  useScrollLock(open)
  const trapRef = useFocusTrap<HTMLDivElement>(open)
  if (!open) return null
  return (
    <OverlayPortal>
      <div className="sb-scrim" onClick={onClose} />
      <div
        className="sb-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={trapRef}
      >
        <div className="sb-sheet__grip" />
        {title && (
          <div className="sb-sheet__header">
            <span className="sb-sheet__title">{title}</span>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>
        )}
        <div className="sb-sheet__body">{children}</div>
        {actions}
      </div>
    </OverlayPortal>
  )
}

/* ---------------- Action Sheet ---------------- */
export interface ActionItem {
  label: string
  icon?: LucideIcon
  danger?: boolean
  onSelect: () => void
}

export function ActionSheet({
  open,
  onClose,
  title,
  actions,
}: {
  open: boolean
  onClose: () => void
  title?: string
  actions: ActionItem[]
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="sb-col" style={{ gap: 2 }}>
        {actions.map((a) => (
          <button
            key={a.label}
            className={cx('sb-actionsheet__item', a.danger && 'sb-actionsheet__item--danger')}
            onClick={() => {
              a.onSelect()
              onClose()
            }}
          >
            {a.icon && <Icon as={a.icon} size="md" />}
            {a.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel: string
}) {
  useEscapeKey(onClose, open)
  useScrollLock(open)
  const trapRef = useFocusTrap<HTMLDivElement>(open)
  if (!open) return null
  return (
    <OverlayPortal>
      <div className="sb-scrim" onClick={onClose} />
      <div className="sb-modal-wrap">
        <div
          className="sb-modal"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          ref={trapRef}
        >
          {children}
        </div>
      </div>
    </OverlayPortal>
  )
}

/* ---------------- Confirmation Dialog ---------------- */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  icon,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  icon?: LucideIcon
}) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel={title}>
      <div className="sb-dialog">
        {icon && (
          <div
            className="sb-dialog__icon"
            style={{
              background: tone === 'danger' ? 'var(--sb-error-soft)' : 'var(--sb-primary-soft)',
              color: tone === 'danger' ? 'var(--sb-error)' : 'var(--sb-primary)',
            }}
          >
            <Icon as={icon} size="lg" />
          </div>
        )}
        <h2 className="sb-dialog__title">{title}</h2>
        <p className="sb-dialog__text">{description}</p>
        <div className="sb-dialog__actions">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Tooltip (pointer devices) ---------------- */
export function Tooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <span className="sb-tip">
      {children}
      <span className="sb-tip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  )
}
