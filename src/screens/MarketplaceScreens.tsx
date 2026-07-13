import { useMemo, useState } from 'react'
import {
  Search,
  Package,
  Store,
  ShoppingBag,
  ShieldCheck,
  MessageSquare,
  Share2,
  ChevronRight,
  Truck,
  CreditCard,
} from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  IconButton,
  SearchInput,
  Chip,
  Icon,
  Button,
  Banner,
  Card,
  EmptyState,
  Avatar,
  ProductGridCard,
  SellerRow,
  Availability,
  StarRating,
  OrderStatusPill,
  productGradient,
  money,
  useToast,
} from '@/components'
import {
  useStore,
  useProducts,
  useProduct,
  useOrders,
  useUser,
} from '@/data/store'

const CATEGORIES = ['All', 'Home', 'Apparel', 'Tech', 'Craft']

/* SC-080 — Marketplace */
export function MarketplaceScreen() {
  const { navigate } = useRouter()
  const store = useStore()
  const products = useProducts()
  const [cat, setCat] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === 'All' || p.category === cat) &&
          (!query.trim() || p.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [products, cat, query],
  )

  return (
    <div className="sb-fill">
      <TopAppBar
        title="Marketplace"
        actions={<IconButton icon={Package} label="My orders" onClick={() => navigate('/orders')} />}
      />
      <div style={{ padding: '0 var(--sb-space-4) var(--sb-space-2)' }} className="sb-col sb-gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search products" />
        <div className="sb-catrow">
          {CATEGORIES.map((c) => (
            <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
        </div>
      </div>
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-3) var(--sb-space-4) var(--sb-space-8)' }}>
        <Banner tone="info" icon={MessageSquare}>
          Every product opens a conversation with its seller — discuss, negotiate, then buy without leaving chat.
        </Banner>
        <div className="sb-mkt-grid" style={{ marginTop: 'var(--sb-space-4)' }}>
          {filtered.map((p) => (
            <ProductGridCard
              key={p.id}
              product={p}
              sellerName={store.state.users[p.sellerId]?.name ?? 'Seller'}
              onClick={() => navigate(`/marketplace/product/${p.id}`)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ paddingTop: 30 }}>
            <EmptyState icon={Search} title="No products found" description="Try a different search or category." />
          </div>
        )}
      </div>
    </div>
  )
}

/* SC-081 — Product Details */
export function ProductDetailsScreen() {
  const { navigate, back } = useRouter()
  const { id } = useParams('/marketplace/product/:id')
  const product = useProduct(id)
  const seller = useUser(product?.sellerId)
  const store = useStore()
  const toast = useToast()

  if (!product) {
    return <div className="sb-fill"><TopAppBar title="Product" onBack={back} /><div className="sb-center">Product not found.</div></div>
  }

  const chatWithSeller = () => {
    const cid = store.openOrCreatePrivate(product.sellerId)
    store.shareProduct(cid, product.id)
    navigate(`/chats/${cid}`)
  }
  const buyNow = () => {
    const cid = store.openOrCreatePrivate(product.sellerId)
    navigate(`/order/new/${product.id}?conv=${cid}`)
  }

  return (
    <div className="sb-fill">
      <TopAppBar
        title="Product"
        onBack={back}
        actions={<IconButton icon={Share2} label="Share" onClick={() => toast.show('Share to a chat (prototype)')} />}
      />
      <div className="sb-shell__main" data-scroll-region>
        <div className="sb-pimg sb-pimg--wide" style={{ background: productGradient(product.image) }}>
          <Icon as={ShoppingBag} size={54} />
        </div>
        <div className="sb-content sb-block" style={{ paddingTop: 'var(--sb-space-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--sb-text-heading)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{product.title}</h1>
            <div className="sb-row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
              <span className="sb-price sb-price--lg">{money(product.price)}</span>
              <Availability value={product.availability} />
            </div>
            <div style={{ marginTop: 6 }}><StarRating value={product.rating} count={product.reviews} /></div>
          </div>

          <Card pad flat>
            <SellerRow name={seller?.name ?? 'Seller'} rating={product.rating} reviews={product.reviews}>
              <Button variant="secondary" size="sm" iconStart={Store} onClick={chatWithSeller}>Visit</Button>
            </SellerRow>
          </Card>

          <div>
            <p className="sb-section-label" style={{ marginBottom: 6 }}>Description</p>
            <p style={{ color: 'var(--sb-text-secondary)', lineHeight: 1.6 }}>{product.description}</p>
          </div>

          <Banner tone="info" icon={ShieldCheck}>
            Verified business · Secure payment · Sensitive payment details never appear in chat.
          </Banner>
        </div>
      </div>

      {/* Conversation-first primary action (PD-036) */}
      <div className="sb-composer" style={{ borderTop: '1px solid var(--sb-border-subtle)' }}>
        <div className="sb-row sb-gap-3">
          <Button variant="secondary" block iconStart={CreditCard} onClick={buyNow}>Buy now</Button>
          <Button block iconStart={MessageSquare} onClick={chatWithSeller}>Chat with seller</Button>
        </div>
      </div>
    </div>
  )
}

/* PT-orders — My Orders (orders are linked to conversations, PD-037) */
export function OrdersListScreen() {
  const { navigate, back } = useRouter()
  const orders = useOrders()
  const store = useStore()

  return (
    <div className="sb-fill">
      <TopAppBar title="My orders" onBack={back} />
      <div className="sb-shell__main" data-scroll-region style={{ padding: 'var(--sb-space-2)' }}>
        {orders.length === 0 ? (
          <div style={{ paddingTop: 40 }}>
            <EmptyState icon={Package} title="No orders yet" description="Orders you place from conversations will appear here." action={<Button onClick={() => navigate('/marketplace')}>Browse marketplace</Button>} />
          </div>
        ) : (
          orders.map((o) => {
            const first = o.items[0]
            return (
              <button key={o.id} className="sb-convo" onClick={() => navigate(`/orders/${o.id}`)}>
                <span className="sb-pimg" style={{ width: 52, height: 52, borderRadius: 12, background: productGradient(first?.image), flexShrink: 0 }}>
                  <Icon as={ShoppingBag} size={20} />
                </span>
                <span className="sb-convo__body">
                  <span className="sb-convo__top">
                    <span className="sb-convo__name">{first?.title}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</span>
                    <span className="sb-price">{money(o.finalPrice)}</span>
                  </span>
                  <span className="sb-convo__bottom" style={{ marginTop: 4 }}>
                    <OrderStatusPill status={o.status} />
                    <span className="sb-convo__preview" style={{ justifyContent: 'flex-end', color: 'var(--sb-text-tertiary)' }}>
                      {store.state.users[o.sellerId]?.name}
                    </span>
                  </span>
                </span>
                <Icon as={ChevronRight} size="sm" />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
