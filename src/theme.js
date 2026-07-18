// ═══════════════════════════════════════════════
//  MIDNIGHT NEON — Design Tokens
//  Voice Expense Tracker
// ═══════════════════════════════════════════════

export const COLORS = {
  // Core backgrounds
  bg:           '#0A0A1A',   // near-black with blue tint
  surface:      '#0F0F2A',   // card / panel background
  surfaceHigh:  '#161633',   // elevated card
  border:       '#1E1E4A',   // subtle border

  // Neon accents
  cyan:         '#00F5FF',   // primary neon — mic, highlights
  purple:       '#BF5FFF',   // secondary — categories
  pink:         '#FF2D87',   // danger / over budget
  green:        '#00FF88',   // success / savings
  gold:         '#FFD700',   // totals / important numbers
  orange:       '#FF8C00',   // warnings

  // Category colours
  catTransport: '#00BFFF',
  catFood:      '#00FF88',
  catHome:      '#BF5FFF',
  catRent:      '#FF8C00',
  catPersonal:  '#FF2D87',
  catOthers:    '#FFD700',

  // Text
  text:         '#FFFFFF',
  textSub:      '#A0A0C0',
  textMuted:    '#505070',

  // Gradients (used as arrays)
  gradCyan:     ['#00F5FF', '#0080FF'],
  gradPurple:   ['#BF5FFF', '#7B2FFF'],
  gradGold:     ['#FFD700', '#FF8C00'],
  gradDark:     ['#0F0F2A', '#0A0A1A'],
  gradGreen:    ['#00FF88', '#00CC66'],
  gradPink:     ['#FF2D87', '#CC0055'],
};

export const FONTS = {
  display:  { fontFamily: 'System', fontWeight: '900' },
  heading:  { fontFamily: 'System', fontWeight: '700' },
  body:     { fontFamily: 'System', fontWeight: '400' },
  mono:     { fontFamily: 'Courier', fontWeight: '600' },
};

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const RADIUS = {
  sm: 8, md: 16, lg: 24, xl: 32, full: 999,
};

export const SHADOW = {
  cyan: {
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  purple: {
    shadowColor: '#BF5FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  gold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const CATEGORIES = [
  { key: 'transport',   label: 'Transport',    emoji: '🚗', color: '#00BFFF', keywords: ['transport','travel','bus','auto','cab','train','uber','ola'] },
  { key: 'food',        label: 'Food',         emoji: '🍽️', color: '#00FF88', keywords: ['food','fruits','snacks','lunch','dinner','breakfast','hotel','restaurant','swiggy','zomato'] },
  { key: 'home',        label: 'Home Things',  emoji: '🏠', color: '#BF5FFF', keywords: ['home','household','home things','furniture','cleaning','kitchen'] },
  { key: 'rent',        label: 'Rent',         emoji: '🏢', color: '#FF8C00', keywords: ['rent','room','house rent'] },
  { key: 'personal',   label: 'Personal Use', emoji: '👤', color: '#FF2D87', keywords: ['personal','petrol','medical','clothing','socks','medicine','doctor','salon','grooming'] },
  { key: 'others',     label: 'Others',       emoji: '❓', color: '#FFD700', keywords: ['others','misc','other','miscellaneous'] },
];

export const PAYMENT_METHODS = [
  { key: 'cash',   label: 'Cash',   emoji: '💵' },
  { key: 'upi',    label: 'UPI',    emoji: '📱' },
  { key: 'card',   label: 'Card',   emoji: '💳' },
  { key: 'bank',   label: 'Bank',   emoji: '🏦' },
];
