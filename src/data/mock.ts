import type {
  AppNotification,
  CallRecord,
  Conversation,
  Message,
  Order,
  Product,
  User,
} from './types'

/*
  Seed data. Timestamps are relative to load time so the prototype always looks
  "fresh". Names/content are realistic mock data (English + a Nepali context,
  per DS-002 multilingual note).
*/

const NOW = Date.now()
const MIN = 60_000
const HR = 60 * MIN
const DAY = 24 * HR
const ago = (ms: number) => NOW - ms

export const ME = 'me'

export const USERS: Record<string, User> = {
  me: { id: 'me', name: 'Aarav Sharma', about: 'Building calm software.', phone: '+977 98•• ••• 210', presence: 'online', verified: true },
  u_sita: { id: 'u_sita', name: 'Sita Rai', about: 'Designer @ SystemBoom', presence: 'online', phone: '+977 9801 234 567' },
  u_bibek: { id: 'u_bibek', name: 'Bibek Thapa', about: 'Coffee & code', presence: 'away', lastSeen: '15 min ago', phone: '+977 9802 345 678' },
  u_anita: { id: 'u_anita', name: 'Anita Gurung', about: 'Travel a lot ✈️', presence: 'offline', lastSeen: 'today at 9:14', phone: '+977 9803 456 789' },
  u_prakash: { id: 'u_prakash', name: 'Prakash Sharma', presence: 'offline', lastSeen: 'yesterday', phone: '+977 9804 567 890' },
  u_maya: { id: 'u_maya', name: 'Maya Karki', presence: 'online', phone: '+977 9805 678 901' },
  u_rojan: { id: 'u_rojan', name: 'Rojan KC', presence: 'away', lastSeen: '1 hr ago', phone: '+977 9806 789 012' },
  u_deepa: { id: 'u_deepa', name: 'Deepa Shrestha', presence: 'online', phone: '+977 9807 890 123' },
  u_arjun: { id: 'u_arjun', name: 'Arjun Basnet', presence: 'offline', lastSeen: '3 hr ago', phone: '+977 9808 901 234' },
  u_boom: { id: 'u_boom', name: 'Boom Store', about: 'Official SystemBoom merchandise', presence: 'online', verified: true, business: true },
  u_mom: { id: 'u_mom', name: 'Aama', presence: 'offline', lastSeen: 'today at 8:02', phone: '+977 9800 000 001' },
  u_dai: { id: 'u_dai', name: 'Nabin Dai', presence: 'away', phone: '+977 9800 000 002' },
}

let seq = 0
type P = Partial<Message> & { authorId: string; at: number }
function build(conversationId: string, rows: P[]): Message[] {
  return rows.map((r) => ({
    id: `m${++seq}`,
    conversationId,
    type: 'text',
    status: 'read',
    ...r,
    authorId: r.authorId,
    createdAt: r.at,
  })) as Message[]
}

/* ---------------- Message threads ---------------- */
const T_SITA = build('c_sita', [
  { authorId: 'u_sita', type: 'text', text: 'Morning! Did you get a chance to look at the new home screen?', at: ago(3 * HR) },
  { authorId: ME, type: 'text', text: 'Yes — the calm spacing is exactly right. Shipping it.', at: ago(3 * HR - 4 * MIN) },
  { authorId: 'u_sita', type: 'text', text: 'Love that 🙌', at: ago(3 * HR - 6 * MIN), reactions: [{ emoji: '❤️', by: [ME] }] },
  { authorId: 'u_sita', type: 'voice', voice: { duration: '0:14', waveform: [3, 6, 9, 5, 8, 12, 7, 4, 9, 6, 3, 8, 11, 5, 7, 4, 6] }, at: ago(2 * HR) },
  { authorId: ME, type: 'text', text: 'Great summary. Let me fold that into the spec.', at: ago(2 * HR - 3 * MIN) },
  { authorId: 'u_sita', type: 'image', image: { url: 'grad-1', caption: 'Latest palette exploration' }, at: ago(40 * MIN), pinned: true },
  { authorId: 'u_sita', type: 'text', text: 'Which one feels most “SystemBoom” to you?', at: ago(38 * MIN) },
  { authorId: ME, type: 'text', text: 'The indigo one. It reads trustworthy without being cold.', at: ago(9 * MIN), status: 'read' },
  { authorId: 'u_sita', type: 'text', text: 'Agreed. I’ll update the tokens 👇', at: ago(4 * MIN) },
])

const T_BOOM = build('c_boom', [
  { authorId: 'u_boom', type: 'text', text: 'Hi Aarav! Thanks for reaching out. How can we help today?', at: ago(1 * DAY) },
  { authorId: ME, type: 'text', text: 'Hey! Interested in the desk mat — is the large size in stock?', at: ago(1 * DAY - 5 * MIN) },
  { authorId: 'u_boom', type: 'product', product: { title: 'SystemBoom Desk Mat — Large', price: 'Rs 2,400', image: 'prod-1', seller: 'Boom Store', availability: 'In stock' }, at: ago(1 * DAY - 8 * MIN) },
  { authorId: 'u_boom', type: 'text', text: 'Yes! Large is in stock. Free delivery inside the valley.', at: ago(1 * DAY - 8 * MIN + 20_000) },
  { authorId: ME, type: 'text', text: 'Perfect. Could you do 2 for a small discount?', at: ago(1 * DAY - 20 * MIN) },
  { authorId: 'u_boom', type: 'text', text: 'We can do Rs 4,500 for two 🙂', at: ago(22 * HR) },
  { authorId: 'u_boom', type: 'link', link: { url: 'https://boomstore.systemboom.app/desk-mat', title: 'Desk Mat — full specs & sizes', desc: 'Natural cork base, stitched edges, 3 sizes.', host: 'boomstore.systemboom.app' }, at: ago(22 * HR + 10_000) },
])

const T_BIBEK = build('c_bibek', [
  { authorId: 'u_bibek', type: 'text', text: 'Sending over the deck for tomorrow', at: ago(6 * HR) },
  { authorId: 'u_bibek', type: 'document', document: { name: 'Q3-Review.pdf', size: '2.4 MB', ext: 'PDF' }, at: ago(6 * HR - 30_000) },
  { authorId: ME, type: 'text', text: 'Got it, thanks. I’ll review tonight.', at: ago(5 * HR) },
  { authorId: 'u_bibek', type: 'voice', voice: { duration: '0:27' }, at: ago(20 * MIN) },
])

const T_ANITA = build('c_anita', [
  { authorId: 'u_anita', type: 'text', text: 'Landing in Pokhara! 🏔️', at: ago(2 * DAY) },
  { authorId: 'u_anita', type: 'location', location: { label: 'Phewa Lakeside', area: 'Pokhara, Nepal' }, at: ago(2 * DAY - 60_000) },
  { authorId: ME, type: 'text', text: 'Amazing! Safe travels 🙏', at: ago(2 * DAY - 5 * MIN) },
  { authorId: 'u_anita', type: 'contact', contact: { name: 'Guide — Ramesh', phone: '+977 9841 000 111' }, at: ago(2 * DAY - 8 * MIN) },
  { authorId: 'u_anita', type: 'text', text: 'Adding our guide in case you visit!', at: ago(2 * DAY - 8 * MIN + 15_000) },
])

const T_PRAKASH = build('c_prakash', [
  { authorId: 'u_prakash', type: 'text', text: 'Call me when you’re free', at: ago(1 * DAY - 2 * HR) },
  { authorId: ME, type: 'text', text: 'Missed you — calling back now', at: ago(1 * DAY - 1 * HR), status: 'delivered' },
])

const T_DESIGN = build('c_design', [
  { authorId: 'u_sita', type: 'system', text: 'Sita Rai created the group “Design Team”', at: ago(9 * DAY) },
  { authorId: 'u_sita', type: 'text', text: 'Welcome everyone! Let’s keep threads calm and focused ✨', at: ago(9 * DAY - 60_000) },
  { authorId: 'u_deepa', type: 'text', text: 'Excited to be here 🙌', at: ago(9 * DAY - 5 * MIN) },
  { authorId: 'u_rojan', type: 'image', image: { url: 'grad-2', caption: 'First pass at the empty states' }, at: ago(2 * DAY) },
  { authorId: 'u_deepa', type: 'text', text: 'These are lovely. The tone feels right.', at: ago(2 * DAY - 3 * MIN), reactions: [{ emoji: '🔥', by: ['u_sita', ME] }] },
  { authorId: ME, type: 'text', text: 'Agree. Let’s standardise the illustration weight though.', at: ago(2 * DAY - 8 * MIN) },
  { authorId: 'u_sita', type: 'text', text: 'On it. Will post updated set here.', at: ago(50 * MIN) },
  { authorId: 'u_rojan', type: 'text', text: 'Deepa can you own the icon audit?', at: ago(30 * MIN) },
  { authorId: 'u_deepa', type: 'text', text: 'Yep — I’ll have it by Friday.', at: ago(12 * MIN) },
])

const T_FAMILY = build('c_family', [
  { authorId: 'u_mom', type: 'text', text: 'Dinner at 7 today, don’t be late 🙂', at: ago(5 * HR) },
  { authorId: 'u_dai', type: 'text', text: 'Coming after work', at: ago(4 * HR) },
  { authorId: ME, type: 'text', text: 'I’ll bring dessert 🍮', at: ago(3 * HR), reactions: [{ emoji: '😍', by: ['u_mom'] }] },
  { authorId: 'u_mom', type: 'text', text: 'Perfect ❤️', at: ago(2 * HR) },
])

const T_ANNOUNCE = build('c_announce', [
  { authorId: 'u_boom', type: 'system', text: 'Announcement Mode is on — only admins can post', at: ago(7 * DAY) },
  { authorId: 'u_boom', type: 'text', text: '📢 New arrivals drop Friday 10am. Early access for members.', at: ago(1 * DAY) },
  { authorId: 'u_boom', type: 'text', text: '📢 Free delivery weekend across the valley. Codes in your inbox.', at: ago(5 * HR), reactions: [{ emoji: '🎉', by: [ME, 'u_sita', 'u_rojan'] }] },
])

const T_MAYA = build('c_maya', [
  { authorId: 'u_maya', type: 'text', text: 'Muted this one but pinging anyway — lunch Saturday?', at: ago(1 * DAY) },
  { authorId: ME, type: 'text', text: 'Yes! Noon works.', at: ago(23 * HR) },
])

const T_ARJUN = build('c_arjun', [
  { authorId: 'u_arjun', type: 'text', text: 'Archived our old project chat — pinging if we restart.', at: ago(30 * DAY) },
  { authorId: ME, type: 'text', text: 'Sounds good 👍', at: ago(30 * DAY - 5 * MIN) },
])

export const MESSAGES: Message[] = [
  ...T_SITA, ...T_BOOM, ...T_BIBEK, ...T_ANITA, ...T_PRAKASH,
  ...T_DESIGN, ...T_FAMILY, ...T_ANNOUNCE, ...T_MAYA, ...T_ARJUN,
]

const ids = (msgs: Message[]) => msgs.map((m) => m.id)

export const CONVERSATIONS: Conversation[] = [
  { id: 'c_sita', kind: 'private', userId: 'u_sita', messageIds: ids(T_SITA), unread: 2, pinned: true, encrypted: true },
  { id: 'c_design', kind: 'group', title: 'Design Team', groupType: 'standard', encrypted: true, participants: [
      { userId: 'u_sita', role: 'owner' }, { userId: ME, role: 'admin' }, { userId: 'u_deepa', role: 'member' },
      { userId: 'u_rojan', role: 'member' }, { userId: 'u_bibek', role: 'member' },
    ], messageIds: ids(T_DESIGN), unread: 5 },
  { id: 'c_boom', kind: 'private', userId: 'u_boom', messageIds: ids(T_BOOM), unread: 1, encrypted: true },
  { id: 'c_bibek', kind: 'private', userId: 'u_bibek', messageIds: ids(T_BIBEK), unread: 1, encrypted: true },
  { id: 'c_family', kind: 'group', title: 'Family', groupType: 'family', encrypted: true, participants: [
      { userId: 'u_mom', role: 'owner' }, { userId: 'u_dai', role: 'member' }, { userId: ME, role: 'member' },
    ], messageIds: ids(T_FAMILY), unread: 0 },
  { id: 'c_anita', kind: 'private', userId: 'u_anita', messageIds: ids(T_ANITA), unread: 0, encrypted: true },
  { id: 'c_announce', kind: 'group', title: 'Boom Sellers', groupType: 'business', announcementMode: true, encrypted: true, participants: [
      { userId: 'u_boom', role: 'owner' }, { userId: ME, role: 'member' }, { userId: 'u_sita', role: 'member' }, { userId: 'u_rojan', role: 'member' },
    ], messageIds: ids(T_ANNOUNCE), unread: 0, muted: true },
  { id: 'c_prakash', kind: 'private', userId: 'u_prakash', messageIds: ids(T_PRAKASH), unread: 0, encrypted: true },
  { id: 'c_maya', kind: 'private', userId: 'u_maya', messageIds: ids(T_MAYA), unread: 0, muted: true, encrypted: true },
  { id: 'c_arjun', kind: 'private', userId: 'u_arjun', messageIds: ids(T_ARJUN), unread: 0, archived: true, encrypted: true },
]

export const CALLS: CallRecord[] = [
  { id: 'call1', userId: 'u_sita', direction: 'outgoing', kind: 'video', at: ago(2 * HR), duration: '12:04' },
  { id: 'call2', userId: 'u_prakash', direction: 'missed', kind: 'voice', at: ago(1 * DAY - 2 * HR) },
  { id: 'call3', userId: 'u_bibek', direction: 'incoming', kind: 'voice', at: ago(1 * DAY), duration: '3:20' },
  { id: 'call4', userId: 'u_deepa', direction: 'outgoing', kind: 'voice', at: ago(2 * DAY), duration: '0:48' },
  { id: 'call5', userId: 'u_anita', direction: 'missed', kind: 'video', at: ago(3 * DAY) },
  { id: 'call6', userId: 'u_maya', direction: 'incoming', kind: 'video', at: ago(4 * DAY), duration: '24:11' },
]

/* ==========================================================================
   ANONYMOUS COMMUNICATION (PS-004 / PS-006) — separate environment (PD-033)
   ========================================================================== */

export const ANON_ADJECTIVES = ['Crimson', 'Violet', 'Silent', 'Midnight', 'Amber', 'Cobalt', 'Ember', 'Shadow', 'Lunar', 'Ivory', 'Onyx', 'Scarlet']
export const ANON_ANIMALS = ['Fox', 'Heron', 'Falcon', 'Otter', 'Wolf', 'Cipher', 'Raven', 'Lynx', 'Moth', 'Owl', 'Koi', 'Hawk']

/** Deterministic hex string from a seed (mock public-key material). */
function seededHex(seed: string, len: number): string {
  let h = 2166136261
  let out = ''
  for (let i = 0; i < len; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 131
    h = Math.imul(h, 16777619) >>> 0
    out += '0123456789ABCDEF'[(h >>> (i % 24)) & 15]
  }
  return out
}

/** Group a hex string into fingerprint blocks: "A1B2 C3D4 …". */
export function toFingerprint(hex: string): string {
  return (hex.match(/.{1,4}/g) ?? []).slice(0, 8).join(' ')
}

/** Build the shareable public key + fingerprint + session id for a seed. */
export function keyMaterial(seed: string) {
  const publicKey = seededHex(seed, 64)
  return {
    publicKey,
    fingerprint: toFingerprint(publicKey),
    sessionId: 'SB-' + seededHex(seed + 'sid', 6),
  }
}

// The device owner's own anonymous identity (active by default).
// Note: 'anon-me' is reserved as the "active identity" route sentinel.
export const MY_ANON = {
  id: 'anon-primary',
  name: 'Amber Falcon 4821',
  ...keyMaterial('amber-falcon-4821'),
  createdAt: NOW - 3 * DAY,
}

// Anonymous contacts — known only by public key + temporary identity.
const ANON_USERS: Record<string, User> = {
  a_heron: { id: 'a_heron', name: 'Silent Heron 2290', presence: 'online', anon: true, ...keyMaterial('silent-heron-2290') },
  a_cipher: { id: 'a_cipher', name: 'Violet Cipher 7731', presence: 'away', lastSeen: '20 min ago', anon: true, ...keyMaterial('violet-cipher-7731') },
  a_raven: { id: 'a_raven', name: 'Onyx Raven 0518', presence: 'offline', anon: true, ...keyMaterial('onyx-raven-0518') },
  a_moth: { id: 'a_moth', name: 'Lunar Moth 3364', presence: 'online', anon: true, ...keyMaterial('lunar-moth-3364') },
}
Object.assign(USERS, ANON_USERS)

const AT_HERON = build('ac_heron', [
  { authorId: 'a_heron', type: 'system', text: 'Identities exchanged via QR. This conversation is end-to-end encrypted.', at: ago(2 * HR) },
  { authorId: 'a_heron', type: 'text', text: 'Hey — got your public key from the QR. This channel is anonymous, right?', at: ago(2 * HR - 60_000) },
  { authorId: ME, type: 'text', text: 'Yes. Neither of us can see the other’s real identity.', at: ago(2 * HR - 3 * MIN) },
  { authorId: 'a_heron', type: 'text', text: 'Perfect. Sharing the draft — feel free to be blunt 🙂', at: ago(90 * MIN) },
  { authorId: 'a_heron', type: 'document', document: { name: 'proposal-v3.pdf', size: '1.2 MB', ext: 'PDF' }, at: ago(88 * MIN) },
  { authorId: ME, type: 'text', text: 'Reading now. Thanks for keeping this off the record.', at: ago(12 * MIN) },
])

const AT_CIPHER = build('ac_cipher', [
  { authorId: 'a_cipher', type: 'system', text: 'This conversation is end-to-end encrypted.', at: ago(1 * DAY) },
  { authorId: 'a_cipher', type: 'text', text: 'Whistleblower channel — please verify my fingerprint before we continue.', at: ago(1 * DAY - 2 * MIN) },
  { authorId: ME, type: 'text', text: 'Verified ✅ Fingerprints match.', at: ago(23 * HR) },
  { authorId: 'a_cipher', type: 'text', text: 'Great. I’ll send details tomorrow.', at: ago(22 * HR) },
])

const AT_NIGHT = build('ac_night', [
  { authorId: ME, type: 'system', text: 'You created the anonymous group “Night Owls”', at: ago(4 * DAY) },
  { authorId: 'a_raven', type: 'text', text: 'Joined via public key. No names here — I like it.', at: ago(4 * DAY - 3 * MIN) },
  { authorId: 'a_moth', type: 'text', text: 'Same. Purely topic-based.', at: ago(3 * DAY) },
  { authorId: 'a_raven', type: 'text', text: 'Agenda for tonight?', at: ago(40 * MIN), reactions: [{ emoji: '👍', by: [ME] }] },
])

MESSAGES.push(...AT_HERON, ...AT_CIPHER, ...AT_NIGHT)

export const ANON_CONVERSATIONS: Conversation[] = [
  { id: 'ac_heron', kind: 'private', env: 'anonymous', userId: 'a_heron', messageIds: ids(AT_HERON), unread: 1, encrypted: true },
  { id: 'ac_cipher', kind: 'private', env: 'anonymous', userId: 'a_cipher', messageIds: ids(AT_CIPHER), unread: 0, encrypted: true },
  { id: 'ac_night', kind: 'group', env: 'anonymous', title: 'Night Owls', groupType: 'standard', encrypted: true, participants: [
      { userId: ME, role: 'owner' }, { userId: 'a_raven', role: 'member' }, { userId: 'a_moth', role: 'member' },
    ], messageIds: ids(AT_NIGHT), unread: 2 },
]
CONVERSATIONS.push(...ANON_CONVERSATIONS)

/* ==========================================================================
   CONVERSATION COMMERCE (PS-003) — commerce lives inside conversations
   ========================================================================== */

// Additional verified business sellers (u_boom already exists).
Object.assign(USERS, {
  u_himal: { id: 'u_himal', name: 'Himal Threads', about: 'Handmade in the Himalayas', presence: 'online', verified: true, business: true } as User,
  u_craft: { id: 'u_craft', name: 'Everest Craft Co.', about: 'Woodwork & ceramics', presence: 'away', lastSeen: '1 hr ago', verified: true, business: true } as User,
})

export const PRODUCTS: Product[] = [
  { id: 'p_deskmat', title: 'SystemBoom Desk Mat — Large', price: 2400, image: 'p1', category: 'Home', sellerId: 'u_boom', availability: 'In stock', rating: 4.8, reviews: 126, description: 'Natural cork base with stitched edges. A calm, premium surface for your desk. 900 × 400 mm.' },
  { id: 'p_buds', title: 'SystemBoom Wireless Buds', price: 6900, image: 'p2', category: 'Tech', sellerId: 'u_boom', availability: 'In stock', rating: 4.6, reviews: 210, description: 'Active noise cancellation, 32-hour battery, and a featherlight fit. Tuned for calls and calm listening.' },
  { id: 'p_tote', title: 'SystemBoom Canvas Tote', price: 1200, image: 'p3', category: 'Apparel', sellerId: 'u_boom', availability: 'In stock', rating: 4.6, reviews: 84, description: 'Heavyweight organic cotton with an internal pocket. Everyday carry, quietly branded.' },
  { id: 'p_bottle', title: 'Insulated Steel Bottle', price: 1800, image: 'p4', category: 'Home', sellerId: 'u_boom', availability: 'Low stock', rating: 4.7, reviews: 52, description: 'Keeps drinks cold 24h / hot 12h. Powder-coated, leak-proof, 750 ml.' },
  { id: 'p_scarf', title: 'Handwoven Pashmina Scarf', price: 3200, image: 'p5', category: 'Craft', sellerId: 'u_himal', availability: 'In stock', rating: 5.0, reviews: 61, description: 'Ethically sourced cashmere, handwoven by artisans in Kathmandu. Soft, warm, timeless.' },
  { id: 'p_hoodie', title: 'Everest Wool Hoodie', price: 4500, image: 'p6', category: 'Apparel', sellerId: 'u_himal', availability: 'Made to order', rating: 4.9, reviews: 38, description: 'Merino-blend, brushed interior, made to your size in 7–10 days.' },
  { id: 'p_lamp', title: 'Walnut Desk Lamp', price: 5200, image: 'p7', category: 'Home', sellerId: 'u_craft', availability: 'In stock', rating: 4.5, reviews: 22, description: 'Solid walnut with a warm dimmable LED. Hand-finished, one at a time.' },
  { id: 'p_journal', title: 'Handbound Journal', price: 900, image: 'p8', category: 'Craft', sellerId: 'u_himal', availability: 'In stock', rating: 4.8, reviews: 73, description: 'Lokta paper, hand-stitched binding. 180 pages, lays flat.' },
  { id: 'p_planter', title: 'Ceramic Planter Set', price: 1600, image: 'p1', category: 'Home', sellerId: 'u_craft', availability: 'In stock', rating: 4.4, reviews: 40, description: 'Set of three hand-thrown planters with drainage trays. Matte glaze.' },
]

// A demo order mid-lifecycle (shipped) to populate tracking + order views.
export const ORDERS: Order[] = [
  {
    id: 'ord_demo',
    conversationId: 'c_boom',
    sellerId: 'u_boom',
    items: [{ productId: 'p_deskmat', title: 'SystemBoom Desk Mat — Large', image: 'p1', unitPrice: 2250, qty: 2 }],
    finalPrice: 4500,
    deliveryFee: 0,
    address: 'Baneshwor, Kathmandu 44600',
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'eSewa wallet',
    createdAt: ago(20 * HR),
    tracking: { code: 'SB7731NP', courier: 'Boom Express' },
  },
]

// Post the order lifecycle into the Boom Store conversation (PD-037).
// Timestamps follow the negotiation (~22h ago) so the thread reads
// inquiry → negotiation → order → payment → shipped, in order.
const ORDER_MSGS = build('c_boom', [
  { authorId: ME, type: 'system', text: 'Order #SB7731NP created · Rs 4,500', at: ago(20 * HR) },
  { authorId: ME, type: 'order', orderRef: { orderId: 'ord_demo' }, at: ago(20 * HR - 30_000) },
  { authorId: 'u_boom', type: 'system', text: 'Payment confirmed ✓', at: ago(20 * HR - 60_000) },
  { authorId: 'u_boom', type: 'text', text: 'Thank you! Packing now — I’ll share tracking shortly. 📦', at: ago(20 * HR - 90_000) },
  { authorId: 'u_boom', type: 'system', text: 'Item shipped · Boom Express (SB7731NP)', at: ago(5 * HR) },
])
MESSAGES.push(...ORDER_MSGS)
{
  const boom = CONVERSATIONS.find((c) => c.id === 'c_boom')
  if (boom) boom.messageIds.push(...ORDER_MSGS.map((m) => m.id))
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'message', fromId: 'u_sita', title: 'Sita Rai', body: 'Agreed. I’ll update the tokens 👇', at: ago(4 * MIN), read: false, conversationId: 'c_sita' },
  { id: 'n2', kind: 'mention', fromId: 'u_rojan', title: 'Design Team', body: 'Rojan mentioned you: “can you own the icon audit?”', at: ago(30 * MIN), read: false, conversationId: 'c_design' },
  { id: 'n3', kind: 'reaction', fromId: 'u_mom', title: 'Aama', body: 'reacted 😍 to your message', at: ago(3 * HR), read: false, conversationId: 'c_family' },
  { id: 'n4', kind: 'missed_call', fromId: 'u_prakash', title: 'Prakash Sharma', body: 'Missed voice call', at: ago(1 * DAY - 2 * HR), read: true, conversationId: 'c_prakash' },
  { id: 'n5', kind: 'group_invite', fromId: 'u_boom', title: 'Boom Sellers', body: 'You were added to the group', at: ago(7 * DAY), read: true, conversationId: 'c_announce' },
  { id: 'n6', kind: 'order', fromId: 'u_boom', title: 'Boom Store', body: 'Item shipped · Boom Express (SB7731NP)', at: ago(5 * HR), read: false, conversationId: 'c_boom' },
]
