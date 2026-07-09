import type {
  AppNotification,
  CallRecord,
  Conversation,
  Message,
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
  { authorId: 'u_sita', type: 'image', image: { url: 'grad-1', caption: 'Latest palette exploration' }, at: ago(40 * MIN) },
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

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'message', fromId: 'u_sita', title: 'Sita Rai', body: 'Agreed. I’ll update the tokens 👇', at: ago(4 * MIN), read: false, conversationId: 'c_sita' },
  { id: 'n2', kind: 'mention', fromId: 'u_rojan', title: 'Design Team', body: 'Rojan mentioned you: “can you own the icon audit?”', at: ago(30 * MIN), read: false, conversationId: 'c_design' },
  { id: 'n3', kind: 'reaction', fromId: 'u_mom', title: 'Aama', body: 'reacted 😍 to your message', at: ago(3 * HR), read: false, conversationId: 'c_family' },
  { id: 'n4', kind: 'missed_call', fromId: 'u_prakash', title: 'Prakash Sharma', body: 'Missed voice call', at: ago(1 * DAY - 2 * HR), read: true, conversationId: 'c_prakash' },
  { id: 'n5', kind: 'group_invite', fromId: 'u_boom', title: 'Boom Sellers', body: 'You were added to the group', at: ago(7 * DAY), read: true, conversationId: 'c_announce' },
]
