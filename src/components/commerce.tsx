import type { ReactNode } from 'react'
import {
  Star,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Store,
  BadgeCheck,
  ChevronRight,
  CreditCard,
  MapPin,
  Home as HomeIcon,
} from 'lucide-react'
import { cx } from '@/lib/utils'
import { useRouter } from '@/lib/router'
import { useOrder } from '@/data/store'
import type { Message, Order, OrderStatus, Product } from '@/data/types'
import { Icon } from './Icon'
import { Button } from './primitives'

/* ---------- money + gradients ---------- */
export const money = (n: number) => `Rs ${n.toLocaleString('en-IN')}`

const PRODUCT_GRAD: Record<string, string> = {
  p1: 'linear-gradient(135deg,#e9b949,#c88a00)',
  p2: 'linear-gradient(135deg,#2d688f,#12303f)',
  p3: 'linear-gradient(135deg,#c9271c,#8e140d)',
  p4: 'linear-gradient(135deg,#3f8f66,#1f6f4a)',
  p5: 'linear-gradient(135deg,#b83280,#7a1f55)',
  p6: 'linear-gradient(135deg,#55606e,#1c2530)',
  p7: 'linear-gradient(135deg,#e08a00,#b25a00)',
  p8: 'linear-gradient(135deg,#0fb0aa,#0a7c78)',
}
export const productGradient = (key?: string) =>
  PRODUCT_GRAD[key ?? ''] ?? 'linear-gradient(135deg,#55606e,#1c2530)'

/* ---------- Star rating (display + input) ---------- */
export function StarRating({
  value,
  onChange,
  size = 16,
  count,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
  count?: number
}) {
  if (onChange) {
    return (
      <span className="sb-stars sb-stars--input" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            data-on={n <= value}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-checked={n === value}
            role="radio"
            onClick={() => onChange(n)}
          >
            <Icon as={Star} size={size + 8} strokeWidth={2} className={n <= value ? 'sb-star-filled' : undefined} />
          </button>
        ))}
      </span>
    )
  }
  return (
    <span className="sb-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} as={Star} size={size} strokeWidth={0} className={n <= Math.round(value) ? 'sb-star-filled' : 'sb-star-empty'} />
      ))}
      <span style={{ marginLeft: 4, fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
        {value.toFixed(1)}
        {count != null && <span style={{ color: 'var(--sb-text-tertiary)', fontWeight: 400 }}> ({count})</span>}
      </span>
    </span>
  )
}

/* ---------- Availability ---------- */
export function Availability({ value }: { value: Product['availability'] }) {
  const cls = value === 'In stock' ? 'in' : value === 'Low stock' ? 'low' : 'made'
  return <span className={cx('sb-avail', `sb-avail--${cls}`)}>● {value}</span>
}

/* ---------- Order status pill ---------- */
export function statusMeta(status: OrderStatus): { label: string; tone: 'pending' | 'progress' | 'done' | 'cancel'; icon: typeof Package } {
  switch (status) {
    case 'pending_payment': return { label: 'Payment due', tone: 'pending', icon: CreditCard }
    case 'confirmed': return { label: 'Confirmed', tone: 'progress', icon: CheckCircle2 }
    case 'shipped': return { label: 'Shipped', tone: 'progress', icon: Package }
    case 'out_for_delivery': return { label: 'Out for delivery', tone: 'progress', icon: Truck }
    case 'delivered': return { label: 'Delivered', tone: 'done', icon: CheckCircle2 }
    case 'completed': return { label: 'Completed', tone: 'done', icon: CheckCircle2 }
    case 'cancelled': return { label: 'Cancelled', tone: 'cancel', icon: Package }
  }
}
export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const m = statusMeta(status)
  return (
    <span className={cx('sb-ostatus', `sb-ostatus--${m.tone}`)}>
      <Icon as={m.icon} size={12} /> {m.label}
    </span>
  )
}

/* ---------- Marketplace product card ---------- */
export function ProductGridCard({
  product,
  sellerName,
  onClick,
}: {
  product: Product
  sellerName: string
  onClick: () => void
}) {
  return (
    <button className="sb-pcard" onClick={onClick}>
      <div className="sb-pimg" style={{ background: productGradient(product.image) }}>
        <Icon as={ShoppingBag} size={30} />
      </div>
      <div className="sb-pcard__body">
        <span className="sb-pcard__title">{product.title}</span>
        <span className="sb-price">{money(product.price)}</span>
        <span className="sb-pcard__seller">
          <Icon as={Store} size={12} /> {sellerName}
        </span>
        <Availability value={product.availability} />
      </div>
    </button>
  )
}

/* ---------- In-chat: product card ---------- */
export function ProductChatCard({ message }: { message: Message }) {
  const { navigate } = useRouter()
  const p = message.product!
  const cid = message.conversationId
  return (
    <div className="sb-ccard">
      <div className="sb-ccard__img" style={{ background: productGradient(p.image) }}>
        <Icon as={ShoppingBag} size={30} />
      </div>
      <div className="sb-ccard__body">
        <div className="sb-ccard__title">{p.title}</div>
        <div className="sb-ccard__row">
          <span className="sb-price">{p.price}</span>
          <Availability value={p.availability} />
        </div>
      </div>
      {p.productId && (
        <div className="sb-ccard__actions">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/marketplace/product/${p.productId}`)}>View</Button>
          <Button variant="soft" size="sm" onClick={() => navigate(`/offer/new/${p.productId}?conv=${cid}`)}>Offer</Button>
          <Button size="sm" onClick={() => navigate(`/order/new/${p.productId}?conv=${cid}`)}>Buy</Button>
        </div>
      )}
    </div>
  )
}

/* ---------- In-chat: offer card (negotiation) ---------- */
export function OfferCard({ message }: { message: Message }) {
  const { navigate } = useRouter()
  const o = message.offer!
  const cid = message.conversationId
  return (
    <div className="sb-ccard">
      <div className="sb-ccard__head sb-ccard__head--offer">
        <Icon as={ShoppingBag} size={13} /> {o.by === 'buyer' ? 'Your offer' : 'Offer'}
      </div>
      <div className="sb-ccard__body">
        <div className="sb-ccard__title">{o.title}</div>
        <div className="sb-ccard__line"><span>Unit price</span><span>{money(o.price)}</span></div>
        <div className="sb-ccard__line"><span>Quantity</span><span>×{o.qty}</span></div>
        <div className="sb-ccard__line"><span>Total</span><span className="sb-price">{money(o.price * o.qty)}</span></div>
        {o.note && <div style={{ fontSize: 'var(--sb-text-label)', color: 'var(--sb-text-tertiary)', marginTop: 4 }}>“{o.note}”</div>}
        <div style={{ marginTop: 8 }}>
          {o.status === 'pending' && <span className="sb-ostatus sb-ostatus--pending">Waiting for seller…</span>}
          {o.status === 'accepted' && <span className="sb-ostatus sb-ostatus--done"><Icon as={CheckCircle2} size={12} /> Accepted</span>}
          {o.status === 'declined' && <span className="sb-ostatus sb-ostatus--cancel">Declined</span>}
        </div>
      </div>
      {o.status === 'accepted' && (
        <div className="sb-ccard__actions">
          <Button size="sm" onClick={() => navigate(`/order/new/${o.productId}?conv=${cid}&price=${o.price}&qty=${o.qty}`)}>Create order</Button>
        </div>
      )}
    </div>
  )
}

/* ---------- In-chat: order card (live status) ---------- */
export function OrderCard({ message }: { message: Message }) {
  const { navigate } = useRouter()
  const order = useOrder(message.orderRef?.orderId)
  if (!order) return null
  const first = order.items[0]
  const cta = orderCta(order)
  return (
    <div className="sb-ccard">
      <div className="sb-ccard__head sb-ccard__head--order">
        <Icon as={Package} size={13} /> Order #{order.tracking?.code ?? order.id.slice(-6).toUpperCase()}
      </div>
      <div className="sb-ccard__body">
        <div className="sb-ccard__title">{first?.title}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</div>
        <div className="sb-ccard__row" style={{ marginTop: 6 }}>
          <OrderStatusPill status={order.status} />
          <span className="sb-price">{money(order.finalPrice)}</span>
        </div>
      </div>
      <div className="sb-ccard__actions">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>Details</Button>
        <Button size="sm" onClick={() => navigate(cta.to)}>{cta.label}</Button>
      </div>
    </div>
  )
}

export function orderCta(order: Order): { label: string; to: string } {
  if (order.paymentStatus === 'unpaid') return { label: 'Pay now', to: `/pay/${order.id}` }
  if (order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'confirmed')
    return { label: 'Track', to: `/orders/${order.id}/track` }
  if (order.status === 'delivered' && !order.reviewed) return { label: 'Review', to: `/orders/${order.id}/review` }
  return { label: 'View', to: `/orders/${order.id}` }
}

/* ---------- Delivery tracking timeline ---------- */
const TRACK_STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'confirmed', label: 'Order confirmed', icon: CheckCircle2 },
  { status: 'shipped', label: 'Shipped', icon: Package },
  { status: 'out_for_delivery', label: 'Out for delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: HomeIcon },
]
const ORDER_RANK: OrderStatus[] = ['pending_payment', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'completed']

export function TrackingTimeline({ order }: { order: Order }) {
  const rank = ORDER_RANK.indexOf(order.status === 'completed' ? 'delivered' : order.status)
  return (
    <div className="sb-track">
      {TRACK_STEPS.map((s, i) => {
        const stepRank = ORDER_RANK.indexOf(s.status)
        const done = rank >= stepRank
        const current = order.status === s.status
        const last = i === TRACK_STEPS.length - 1
        return (
          <div className="sb-track__step" key={s.status}>
            <div className="sb-track__rail">
              <span className={cx('sb-track__dot', current ? 'sb-track__dot--current' : done && 'sb-track__dot--done')}>
                <Icon as={s.icon} size={14} />
              </span>
              {!last && <span className={cx('sb-track__conn', rank > stepRank && 'sb-track__conn--done')} />}
            </div>
            <div className="sb-track__body">
              <div className={cx('sb-track__title', !done && 'sb-track__title--muted')}>{s.label}</div>
              {done && (
                <div className="sb-track__time">
                  {current ? 'In progress' : 'Completed'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Seller badge ---------- */
export function SellerRow({ name, rating, reviews, children }: { name: string; rating: number; reviews: number; children?: ReactNode }) {
  return (
    <div className="sb-row sb-gap-3" style={{ alignItems: 'center' }}>
      <span className="sb-hub__tile-icon" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sb-gold-soft)', color: 'var(--sb-gold)' }}>
        <Icon as={Store} size="md" />
      </span>
      <div className="sb-grow">
        <div className="sb-row sb-gap-1" style={{ fontWeight: 700 }}>
          {name} <Icon as={BadgeCheck} size={15} className="sb-inline-verified" label="Verified business" />
        </div>
        <StarRating value={rating} count={reviews} size={13} />
      </div>
      {children}
    </div>
  )
}
