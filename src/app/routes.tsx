import type { ReactNode } from 'react'
import {
  Home,
  MessageSquare,
  Phone,
  Store,
  CircleUser,
  VenetianMask,
  UserCog,
} from 'lucide-react'
import { matchPath } from '@/lib/router'
import type { NavItem } from '@/components'

import { SplashScreen } from '@/screens/SplashScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { DesignSystemScreen } from '@/screens/DesignSystemScreen'
import { NotFoundScreen } from '@/screens/NotFoundScreen'
import { ChatListScreen } from '@/screens/ChatListScreen'
import { ConversationScreen } from '@/screens/ConversationScreen'
import { NewChatScreen, CreateGroupScreen } from '@/screens/NewChatScreen'
import {
  ChatInfoScreen,
  SharedMediaScreen,
  PinnedMessagesScreen,
  ChatSearchScreen,
} from '@/screens/ChatDetailScreens'
import { CallHistoryScreen, CallScreen } from '@/screens/CallsScreens'
import {
  NotificationsScreen,
  SettingsScreen,
  SettingsDetailScreen,
} from '@/screens/SystemScreens'
import {
  MarketplaceScreen,
  ProductDetailsScreen,
  OrdersListScreen,
} from '@/screens/MarketplaceScreens'
import {
  CreateOrderScreen,
  MakeOfferScreen,
  PaymentScreen,
  OrderDetailsScreen,
  TrackingScreen,
  ReviewScreen,
} from '@/screens/OrderScreens'
import {
  AnonymousHomeScreen,
  AnonChatListScreen,
  MyQRScreen,
  QRScannerScreen,
  PublicKeyScreen,
  IdentityManagerScreen,
  AnonCreateGroupScreen,
} from '@/screens/AnonScreens'

export type Chrome = 'full' | 'app'

export interface RouteDef {
  /** Screen ID from SM-002 (Screen Inventory) or a prototype tool id. */
  id: string
  pattern: string
  element: ReactNode
  chrome: Chrome
  /** Which Level-1 nav destination owns this screen (for active state). */
  tab?: string
  /** Pushed/detail screen — hide bottom nav on mobile so content is the hero. */
  deep?: boolean
}

/*
  Route registry — the SC-XXX ID is the shared language (SM-002, PD-039).
  Phase 1 maps the foundation + Level-1 destinations. Later phases extend it.
*/
export const ROUTES: RouteDef[] = [
  { id: 'SC-001', pattern: '/', element: <SplashScreen />, chrome: 'full' },
  { id: 'SC-001', pattern: '/splash', element: <SplashScreen />, chrome: 'full' },
  { id: 'SC-002', pattern: '/welcome', element: <WelcomeScreen />, chrome: 'full' },

  { id: 'SC-003', pattern: '/home', element: <HomeScreen />, chrome: 'app', tab: 'home' },

  // Registered Communication
  { id: 'SC-020', pattern: '/chats', element: <ChatListScreen />, chrome: 'app', tab: 'chats' },
  { id: 'SC-020', pattern: '/archived', element: <ChatListScreen archived />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-023', pattern: '/new-chat', element: <NewChatScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-023', pattern: '/new-group', element: <CreateGroupScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-021', pattern: '/chats/:id', element: <ConversationScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-025', pattern: '/chats/:id/info', element: <ChatInfoScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-026', pattern: '/chats/:id/media', element: <SharedMediaScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-027', pattern: '/chats/:id/pinned', element: <PinnedMessagesScreen />, chrome: 'app', tab: 'chats', deep: true },
  { id: 'SC-024', pattern: '/chats/:id/search', element: <ChatSearchScreen />, chrome: 'app', tab: 'chats', deep: true },

  // Calls
  { id: 'SC-063', pattern: '/calls', element: <CallHistoryScreen />, chrome: 'app', tab: 'calls' },
  { id: 'SC-061', pattern: '/call/:id', element: <CallScreen />, chrome: 'full' },

  // Conversation Commerce (PS-003) — commerce extends conversations (PD-036)
  { id: 'SC-080', pattern: '/marketplace', element: <MarketplaceScreen />, chrome: 'app', tab: 'marketplace' },
  { id: 'SC-081', pattern: '/marketplace/product/:id', element: <ProductDetailsScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-083', pattern: '/order/new/:productId', element: <CreateOrderScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-082', pattern: '/offer/new/:productId', element: <MakeOfferScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-085', pattern: '/pay/:id', element: <PaymentScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'PT-orders', pattern: '/orders', element: <OrdersListScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-084', pattern: '/orders/:id', element: <OrderDetailsScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-086', pattern: '/orders/:id/track', element: <TrackingScreen />, chrome: 'app', tab: 'marketplace', deep: true },
  { id: 'SC-087', pattern: '/orders/:id/review', element: <ReviewScreen />, chrome: 'app', tab: 'marketplace', deep: true },

  { id: 'SC-100', pattern: '/profile', element: <ProfileScreen />, chrome: 'app', tab: 'profile' },

  // Settings
  { id: 'SC-101', pattern: '/settings', element: <SettingsScreen />, chrome: 'app', tab: 'profile', deep: true },
  { id: 'SC-102', pattern: '/settings/:section', element: <SettingsDetailScreen />, chrome: 'app', tab: 'profile', deep: true },

  // Notifications inbox (global; settings live at /settings/notifications = SC-104)
  { id: 'PT-notifications', pattern: '/notifications', element: <NotificationsScreen />, chrome: 'app', deep: true },

  // Anonymous Communication (PS-004 / PD-033) — a separate environment
  { id: 'SC-040', pattern: '/anon', element: <AnonymousHomeScreen />, chrome: 'app', tab: 'anon-home' },
  { id: 'SC-041', pattern: '/anon/chats', element: <AnonChatListScreen />, chrome: 'app', tab: 'anon-chats' },
  { id: 'SC-042', pattern: '/anon/chats/:id', element: <ConversationScreen />, chrome: 'app', deep: true },
  { id: 'SC-044', pattern: '/anon/scan', element: <QRScannerScreen />, chrome: 'app', deep: true },
  { id: 'SC-045', pattern: '/anon/qr', element: <MyQRScreen />, chrome: 'app', deep: true },
  { id: 'SC-046', pattern: '/anon/key/:id', element: <PublicKeyScreen />, chrome: 'app', deep: true },
  { id: 'SC-047', pattern: '/anon/identities', element: <IdentityManagerScreen />, chrome: 'app', tab: 'anon-id' },
  { id: 'PT-anon-newgroup', pattern: '/anon/new-group', element: <AnonCreateGroupScreen />, chrome: 'app', deep: true },

  { id: 'PT-design', pattern: '/design', element: <DesignSystemScreen />, chrome: 'app', deep: true },
]

/** Is this path inside the Anonymous Communication environment? */
export function isAnonPath(path: string): boolean {
  return path === '/anon' || path.startsWith('/anon/')
}

export interface ResolvedRoute {
  route: RouteDef
  params: Record<string, string>
}

export function resolveRoute(path: string): ResolvedRoute {
  for (const route of ROUTES) {
    const params = matchPath(route.pattern, path)
    if (params) return { route, params }
  }
  return {
    route: { id: 'SC-404', pattern: path, element: <NotFoundScreen />, chrome: 'app' },
    params: {},
  }
}

/* Level-1 destinations — max 5 (DS-003 Bottom Navigation) — SM-001 Level 1. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/home' },
  { id: 'chats', label: 'Chats', icon: MessageSquare, to: '/chats', badge: 3 },
  { id: 'calls', label: 'Calls', icon: Phone, to: '/calls' },
  { id: 'marketplace', label: 'Market', icon: Store, to: '/marketplace' },
  { id: 'profile', label: 'Profile', icon: CircleUser, to: '/profile' },
]

/* Anonymous environment nav — messaging only (PS-004: no other modules). */
export const ANON_NAV_ITEMS: NavItem[] = [
  { id: 'anon-home', label: 'Anonymous', icon: VenetianMask, to: '/anon' },
  { id: 'anon-chats', label: 'Chats', icon: MessageSquare, to: '/anon/chats' },
  { id: 'anon-id', label: 'Identity', icon: UserCog, to: '/anon/identities' },
]
