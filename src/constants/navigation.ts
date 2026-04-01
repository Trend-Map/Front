export const PRIMARY_NAV_ITEMS = [
  { label: '순위', to: '/ranking' },
  { label: '커뮤니티', to: '/community' },
  { label: '검색', to: '/search' },
] as const;

export const ACCOUNT_ROUTE = '/search?my';

export const MOBILE_NAV_ITEMS = [
  { to: '/', icon: '⌂', label: '홈', match: 'home' },
  { to: '/ranking', icon: '↑', label: '순위', match: 'trends' },
  { to: '/community', icon: '✦', label: '커뮤니티', match: 'community' },
  { to: '/search', icon: '⌕', label: '검색', match: 'search' },
  { to: ACCOUNT_ROUTE, icon: '○', label: '마이', match: 'my' },
] as const;
