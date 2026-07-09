import type { ReactNode } from 'react'
import {
  Home,
  MessageSquare,
  Phone,
  Store,
  CircleUser,
} from 'lucide-react'
import { matchPath } from '@/lib/router'
import type { NavItem } from '@/components'

import { SplashScreen } from '@/screens/SplashScreen'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { DesignSystemScreen } from '@/screens/DesignSystemScreen'
import { NotFoundScreen } from '@/screens/NotFoundScreen'
import {
  ChatsScreen,
  CallsScreen,
  MarketplaceScreen,
  AnonymousScreen,
} from '@/screens/destinations'

export type Chrome = 'full' | 'app'

export interface RouteDef {
  /** Screen ID from SM-002 (Screen Inventory) or a prototype tool id. */
  id: string
  pattern: string
  element: ReactNode
  chrome: Chrome
  /** Which Level-1 nav destination owns this screen (for active state). */
  tab?: string
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
  { id: 'SC-020', pattern: '/chats', element: <ChatsScreen />, chrome: 'app', tab: 'chats' },
  { id: 'SC-063', pattern: '/calls', element: <CallsScreen />, chrome: 'app', tab: 'calls' },
  { id: 'SC-080', pattern: '/marketplace', element: <MarketplaceScreen />, chrome: 'app', tab: 'marketplace' },
  { id: 'SC-100', pattern: '/profile', element: <ProfileScreen />, chrome: 'app', tab: 'profile' },

  { id: 'SC-040', pattern: '/anonymous', element: <AnonymousScreen />, chrome: 'app' },
  { id: 'PT-design', pattern: '/design', element: <DesignSystemScreen />, chrome: 'app' },
]

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
