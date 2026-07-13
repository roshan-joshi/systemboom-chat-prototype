import { useState } from 'react'
import {
  Minus,
  Plus,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Wallet,
  CreditCard,
  Landmark,
  Banknote,
  Check,
  Truck,
  MessageSquare,
  Star,
  Package,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  Icon,
  Button,
  Card,
  Banner,
  Field,
  Textarea,
  Spinner,
  Avatar,
  OrderStatusPill,
  TrackingTimeline,
  StarRating,
  productGradient,
  money,
  statusMeta,
  orderCta,
  useToast,
} from '@/components'
import { useStore, useProduct, useOrder, useUser } from '@/data/store'
import { callTime } from '@/data/format'

const DEFAULT_ADDRESS = 'Baneshwor, Kathmandu 44600'

/* SC-083 — Create Order */
export function CreateOrderScreen() {
  const { navigate, back, query } = useRouter()
  const { productId } = useParams('/order/new/:productId')
  const product = useProduct(productId)
  const store = useStore()
  const convId = query.get('conv') || undefined
  const presetPrice = query.get('price')
  const presetQty = query.get('qty')

  const [qty, setQty] = useState(presetQty ? Number(presetQty) : 1)
  const [address, setAddress] = useState(DEFAULT_ADDRESS)

  if (!product) return <div className="sb-fill"><TopAppBar title="Create order" onBack={back} /></div>

  const unitPrice = presetPrice ? Number(presetPrice) : product.price
  const subtotal = unitPrice * qty
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  const place = () => {
    const cid = convId || store.openOrCreatePrivate(product.sellerId)
    const orderId = store.createOrder({
      conversationId: cid,
      sellerId: product.sellerId,
      items: [{ productId: product.id, title: product.title, image: product.image, unitPrice, qty }],
      deliveryFee,
      address,
    })
    navigate(`/pay/${orderId}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="Create order" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          {/* item */}
          <Card pad flat>
            <div className="sb-row sb-gap-3">
              <span className="sb-pimg" style={{ width: 64, height: 64, borderRadius: 12, background: productGradient(product.image), flexShrink: 0 }}>
                <Icon as={ShoppingBag} size={24} />
              </span>
              <div className="sb-grow">
                <div style={{ fontWeight: 600, fontSize: 'var(--sb-text-caption)', lineHeight: 1.3 }}>{product.title}</div>
                <div className="sb-price" style={{ marginTop: 2 }}>{money(unitPrice)}</div>
              </div>
              <div className="sb-row sb-gap-2">
                <button className="sb-iconbtn sb-iconbtn--sm" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ border: '1px solid var(--sb-border-strong)' }}><Icon as={Minus} size="sm" /></button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button className="sb-iconbtn sb-iconbtn--sm" aria-label="Increase" onClick={() => setQty((q) => q + 1)} style={{ border: '1px solid var(--sb-border-strong)' }}><Icon as={Plus} size="sm" /></button>
              </div>
            </div>
          </Card>

          {/* address */}
          <Field label="Delivery address">
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </Field>

          {/* summary */}
          <Card pad flat>
            <div className="sb-sumline"><span>Subtotal ({qty} item{qty > 1 ? 's' : ''})</span><span>{money(subtotal)}</span></div>
            <div className="sb-sumline"><span>Delivery</span><span style={{ color: 'var(--sb-success)' }}>Free</span></div>
            <div className="sb-sumline sb-sumline--total"><span>Total</span><span className="sb-price">{money(total)}</span></div>
          </Card>

          <Banner tone="info" icon={ShieldCheck}>This order stays linked to your conversation. You can message the seller anytime.</Banner>
        </div>
      </div>
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
        <Button size="lg" block onClick={place}>Place order · {money(total)}</Button>
      </div>
    </div>
  )
}

/* Make an offer (SC-082 negotiation — price/quantity, PS-003).
   The offer lands in the conversation as an offer card; history stays in chat. */
export function MakeOfferScreen() {
  const { navigate, back, query } = useRouter()
  const { productId } = useParams('/offer/new/:productId')
  const product = useProduct(productId)
  const store = useStore()
  const convId = query.get('conv') || undefined

  const [price, setPrice] = useState(() => product?.price ?? 0)
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')

  if (!product) return <div className="sb-fill"><TopAppBar title="Make an offer" onBack={back} /></div>

  const presets = [
    { label: 'List price', value: product.price },
    { label: '-5%', value: Math.round(product.price * 0.95) },
    { label: '-10%', value: Math.round(product.price * 0.9) },
    { label: '-15%', value: Math.round(product.price * 0.85) },
  ]

  const send = () => {
    const cid = convId || store.openOrCreatePrivate(product.sellerId)
    store.sendOffer(cid, { productId: product.id, price, qty, note: note.trim() || undefined })
    navigate(`/chats/${cid}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="Make an offer" subtitle={product.title} onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <Card pad flat>
            <div className="sb-row sb-gap-3">
              <span className="sb-pimg" style={{ width: 56, height: 56, borderRadius: 12, background: productGradient(product.image), flexShrink: 0 }}>
                <Icon as={ShoppingBag} size={22} />
              </span>
              <div className="sb-grow">
                <div style={{ fontWeight: 600, fontSize: 'var(--sb-text-caption)', lineHeight: 1.3 }}>{product.title}</div>
                <div style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>Listed at {money(product.price)}</div>
              </div>
            </div>
          </Card>

          <div className="sb-block">
            <p className="sb-section-label">Your price (per item)</p>
            <div style={{ textAlign: 'center', padding: 'var(--sb-space-3) 0' }}>
              <span className="sb-price" style={{ fontSize: 'var(--sb-text-display)' }}>{money(price)}</span>
            </div>
            <div className="sb-row sb-gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              {presets.map((p) => (
                <button
                  key={p.label}
                  className="sb-chip"
                  aria-pressed={price === p.value}
                  onClick={() => setPrice(p.value)}
                >
                  {p.label} · {money(p.value)}
                </button>
              ))}
            </div>
          </div>

          <Card pad flat>
            <div className="sb-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Quantity</span>
              <div className="sb-row sb-gap-2">
                <button className="sb-iconbtn sb-iconbtn--sm" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ border: '1px solid var(--sb-border-strong)' }}><Icon as={Minus} size="sm" /></button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button className="sb-iconbtn sb-iconbtn--sm" aria-label="Increase" onClick={() => setQty((q) => q + 1)} style={{ border: '1px solid var(--sb-border-strong)' }}><Icon as={Plus} size="sm" /></button>
              </div>
            </div>
            <div className="sb-sumline sb-sumline--total"><span>Offer total</span><span className="sb-price">{money(price * qty)}</span></div>
          </Card>

          <Field label="Add a note (optional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="e.g. Can you do this for two?" />
          </Field>

          <Banner tone="info" icon={MessageSquare}>
            Your offer is sent into the conversation. Negotiation history stays in chat.
          </Banner>
        </div>
      </div>
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
        <Button size="lg" block onClick={send}>Send offer · {money(price * qty)}</Button>
      </div>
    </div>
  )
}

/* SC-085 — Payment */
const METHODS: { id: string; label: string; sub: string; icon: LucideIcon; color: string }[] = [
  { id: 'eSewa wallet', label: 'eSewa', sub: 'Wallet balance', icon: Wallet, color: '#3f8f66' },
  { id: 'Khalti', label: 'Khalti', sub: 'Digital wallet', icon: Wallet, color: '#6b52c9' },
  { id: 'Card', label: 'Card', sub: 'Visa · Mastercard', icon: CreditCard, color: '#2d688f' },
  { id: 'Bank transfer', label: 'Bank transfer', sub: 'Connected IPS', icon: Landmark, color: '#55606e' },
  { id: 'Cash on delivery', label: 'Cash on delivery', sub: 'Pay when it arrives', icon: Banknote, color: '#c88a00' },
]

export function PaymentScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/pay/:id')
  const order = useOrder(id)
  const store = useStore()
  const toast = useToast()
  const [method, setMethod] = useState('eSewa wallet')
  const [paying, setPaying] = useState(false)

  if (!order) return <div className="sb-fill"><TopAppBar title="Payment" onBack={back} /></div>

  // Already paid — show the completed state; never offer a second payment.
  if (order.paymentStatus === 'paid') {
    return (
      <div className="sb-fill">
        <TopAppBar title="Payment" onBack={back} />
        <div className="sb-shell__main" data-scroll-region>
          <div className="sb-content sb-block" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'var(--sb-space-8)' }}>
            <span style={{ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--sb-success-soft)', color: 'var(--sb-success)' }}>
              <Icon as={Check} size={36} />
            </span>
            <div>
              <h2 style={{ fontSize: 'var(--sb-text-title)', fontWeight: 700 }}>Payment complete</h2>
              <p style={{ color: 'var(--sb-text-secondary)', marginTop: 6 }}>
                {money(order.finalPrice)} · {order.paymentMethod}
              </p>
            </div>
            <div className="sb-securebar"><Icon as={ShieldCheck} size="sm" /> This order has already been paid.</div>
            <div className="sb-col sb-gap-3" style={{ width: '100%', maxWidth: 360 }}>
              <Button block onClick={() => navigate(`/orders/${order.id}`)}>View order</Button>
              <Button variant="secondary" block iconStart={MessageSquare} onClick={() => navigate(`/chats/${order.conversationId}`)}>Back to conversation</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const pay = () => {
    setPaying(true)
    window.setTimeout(() => {
      store.payOrder(order.id, method)
      toast.success('Payment confirmed')
      navigate(`/chats/${order.conversationId}`, { replace: true })
    }, 1600)
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="Payment" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-5)' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="sb-section-label">Amount to pay</p>
            <div className="sb-price" style={{ fontSize: 'var(--sb-text-display)' }}>{money(order.finalPrice)}</div>
          </div>

          <div className="sb-block">
            <p className="sb-section-label">Payment method</p>
            <div className="sb-col sb-gap-2">
              {METHODS.map((mth) => (
                <button key={mth.id} className="sb-paymethod" aria-pressed={method === mth.id} onClick={() => setMethod(mth.id)}>
                  <span className="sb-paymethod__icon" style={{ background: mth.color }}><Icon as={mth.icon} size="sm" /></span>
                  <span className="sb-grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>{mth.label}</span>
                    <span style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>{mth.sub}</span>
                  </span>
                  <span className="sb-paymethod__radio" />
                </button>
              ))}
            </div>
          </div>

          <div className="sb-securebar">
            <Icon as={ShieldCheck} size="sm" /> Secured by SystemBoom Pay · details are never stored or shown in chat
          </div>
        </div>
      </div>
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
        <Button size="lg" block loading={paying} onClick={pay}>
          {paying ? 'Processing…' : method === 'Cash on delivery' ? 'Confirm order' : `Pay ${money(order.finalPrice)}`}
        </Button>
      </div>
    </div>
  )
}

/* SC-084 — Order Details */
export function OrderDetailsScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/orders/:id')
  const order = useOrder(id)
  const seller = useUser(order?.sellerId)

  if (!order) return <div className="sb-fill"><TopAppBar title="Order" onBack={back} /><div className="sb-center">Order not found.</div></div>
  const cta = orderCta(order)

  return (
    <div className="sb-fill">
      <TopAppBar title="Order details" subtitle={order.tracking?.code} onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <div className="sb-row" style={{ justifyContent: 'space-between' }}>
            <OrderStatusPill status={order.status} />
            <span style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>{callTime(order.createdAt)}</span>
          </div>

          {/* items */}
          <Card pad flat>
            {order.items.map((it) => (
              <div key={it.productId} className="sb-row sb-gap-3" style={{ marginBottom: 4 }}>
                <span className="sb-pimg" style={{ width: 52, height: 52, borderRadius: 10, background: productGradient(it.image), flexShrink: 0 }}>
                  <Icon as={ShoppingBag} size={18} />
                </span>
                <div className="sb-grow">
                  <div style={{ fontWeight: 600, fontSize: 'var(--sb-text-caption)' }}>{it.title}</div>
                  <div style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>{money(it.unitPrice)} × {it.qty}</div>
                </div>
                <span className="sb-price">{money(it.unitPrice * it.qty)}</span>
              </div>
            ))}
            <div className="sb-sumline" style={{ marginTop: 6 }}><span>Delivery</span><span style={{ color: 'var(--sb-success)' }}>{order.deliveryFee ? money(order.deliveryFee) : 'Free'}</span></div>
            <div className="sb-sumline sb-sumline--total"><span>Total</span><span className="sb-price">{money(order.finalPrice)}</span></div>
          </Card>

          {/* meta rows */}
          <div className="sb-settings-group">
            <div className="sb-settings-row">
              <span className="sb-settings-row__icon"><Icon as={CreditCard} size="sm" /></span>
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title">Payment</span>
                <span className="sb-settings-row__sub">{order.paymentStatus === 'paid' ? `Paid · ${order.paymentMethod}` : 'Payment due'}</span>
              </span>
              <span className={order.paymentStatus === 'paid' ? 'sb-ostatus sb-ostatus--done' : 'sb-ostatus sb-ostatus--pending'}>
                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div className="sb-settings-row">
              <span className="sb-settings-row__icon"><Icon as={MapPin} size="sm" /></span>
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title">Delivery address</span>
                <span className="sb-settings-row__sub">{order.address}</span>
              </span>
            </div>
            {order.tracking && (
              <button className="sb-settings-row sb-settings-row--btn" onClick={() => navigate(`/orders/${order.id}/track`)}>
                <span className="sb-settings-row__icon"><Icon as={Truck} size="sm" /></span>
                <span className="sb-settings-row__body">
                  <span className="sb-settings-row__title">Tracking</span>
                  <span className="sb-settings-row__sub">{order.tracking.courier} · {order.tracking.code}</span>
                </span>
                <Icon as={ChevronRight} size="sm" />
              </button>
            )}
            <div className="sb-settings-row">
              <Avatar name={seller?.name ?? 'Seller'} kind="business" size="md" />
              <span className="sb-settings-row__body">
                <span className="sb-settings-row__title">{seller?.name}</span>
                <span className="sb-settings-row__sub">Seller</span>
              </span>
            </div>
          </div>

          <Button variant="secondary" block iconStart={MessageSquare} onClick={() => navigate(`/chats/${order.conversationId}`)}>
            Back to conversation
          </Button>
        </div>
      </div>
      {(order.paymentStatus === 'unpaid' || (order.status === 'delivered' && !order.reviewed) || order.status === 'shipped' || order.status === 'out_for_delivery') && (
        <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
          <Button size="lg" block onClick={() => navigate(cta.to)}>{cta.label}</Button>
        </div>
      )}
    </div>
  )
}

/* SC-086 — Delivery Tracking */
export function TrackingScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/orders/:id/track')
  const order = useOrder(id)

  if (!order) return <div className="sb-fill"><TopAppBar title="Tracking" onBack={back} /></div>
  const m = statusMeta(order.status)

  return (
    <div className="sb-fill">
      <TopAppBar title="Delivery tracking" subtitle={order.tracking?.code} onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        {/* map placeholder */}
        <div style={{ height: 150, background: 'linear-gradient(160deg,#2d688f,#12303f)', display: 'grid', placeItems: 'center', color: '#fff', position: 'relative' }}>
          <Icon as={Truck} size={40} />
          <span className="sb-ostatus sb-ostatus--progress" style={{ position: 'absolute', bottom: 12, background: 'rgba(255,255,255,0.92)' }}>{m.label}</span>
        </div>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <Card pad flat>
            <div className="sb-row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="sb-settings-row__sub">Courier</div>
                <div style={{ fontWeight: 700 }}>{order.tracking?.courier ?? 'Boom Express'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="sb-settings-row__sub">Tracking code</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--sb-font-mono)' }}>{order.tracking?.code}</div>
              </div>
            </div>
          </Card>

          <div className="sb-block">
            <p className="sb-section-label">Progress</p>
            <Card pad flat>
              <TrackingTimeline order={order} />
            </Card>
          </div>

          <Button variant="secondary" block iconStart={MessageSquare} onClick={() => navigate(`/chats/${order.conversationId}`)}>Message seller</Button>
          {order.status === 'delivered' && !order.reviewed && (
            <Button block iconStart={Star} onClick={() => navigate(`/orders/${order.id}/review`)}>Leave a review</Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* SC-087 — Reviews */
export function ReviewScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/orders/:id/review')
  const order = useOrder(id)
  const seller = useUser(order?.sellerId)
  const store = useStore()
  const toast = useToast()
  const [sellerRating, setSellerRating] = useState(5)
  const [productRating, setProductRating] = useState(5)
  const [text, setText] = useState('')

  if (!order) return <div className="sb-fill"><TopAppBar title="Review" onBack={back} /></div>

  const submit = () => {
    store.reviewOrder(order.id, { sellerRating, productRating, text })
    toast.success('Thanks for your review')
    navigate(`/chats/${order.conversationId}`, { replace: true })
  }

  return (
    <div className="sb-fill">
      <TopAppBar title="Leave a review" onBack={back} />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-5)' }}>
          <div style={{ textAlign: 'center' }}>
            <Icon as={Package} size={40} className="sb-review-check" />
            <h2 style={{ fontSize: 'var(--sb-text-title)', fontWeight: 700, marginTop: 8 }}>How was your order?</h2>
            <p style={{ color: 'var(--sb-text-secondary)' }}>{order.items[0]?.title}</p>
          </div>

          <Card pad flat className="sb-col sb-gap-4">
            <div className="sb-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Rate {seller?.name}</span>
              <StarRating value={sellerRating} onChange={setSellerRating} />
            </div>
            <div className="sb-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Rate the product</span>
              <StarRating value={productRating} onChange={setProductRating} />
            </div>
          </Card>

          <Field label="Your feedback (optional)">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Share what you liked…" />
          </Field>
        </div>
      </div>
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
        <Button size="lg" block onClick={submit}>Submit review</Button>
      </div>
    </div>
  )
}
