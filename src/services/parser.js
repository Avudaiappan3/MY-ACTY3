import { CATEGORIES, PAYMENT_METHODS } from '../theme';

// ── Word numbers (English + Tamil transliteration) ────────────────────────────
const WORD_NUMS = {
  zero:0, one:1, two:2, three:3, four:4, five:5,
  six:6, seven:7, eight:8, nine:9, ten:10,
  eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15,
  sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
  thirty:30, forty:40, fifty:50, sixty:60, seventy:70,
  eighty:80, ninety:90, hundred:100, thousand:1000,
  // Tamil transliteration
  onnu:1, rendu:2, moonu:3, naalu:4, aanju:5,
  aaru:6, ezhu:7, ettu:8, onbadu:9, pathu:10,
  nooru:100, aayiram:1000,
};

// ── Normalize spoken text ─────────────────────────────────────────────────────
function normalize(text) {
  let t = text.toLowerCase().trim();
  // Replace word numbers
  Object.entries(WORD_NUMS).forEach(([word, val]) => {
    if (val > 0) t = t.replace(new RegExp(`\\b${word}\\b`, 'g'), ` ${val} `);
  });
  // Remove filler words
  t = t.replace(/\b(rupees?|rs|inr|spent|spend|added|pay|paid|for|on|the|a|an)\b/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

// ── Extract amount ────────────────────────────────────────────────────────────
function extractAmount(text) {
  // Support "50+50" expressions
  const expr = text.match(/(\d+)\s*\+\s*(\d+)/);
  if (expr) return parseInt(expr[1]) + parseInt(expr[2]);

  const nums = text.match(/\d+(?:\.\d+)?/g);
  if (!nums) return null;
  return parseFloat(Math.max(...nums.map(Number)));
}

// ── Extract category ──────────────────────────────────────────────────────────
function extractCategory(text) {
  // Sort by keyword length descending (match "home things" before "home")
  const allKeywords = [];
  CATEGORIES.forEach(cat => {
    cat.keywords.forEach(kw => allKeywords.push({ kw, cat }));
  });
  allKeywords.sort((a, b) => b.kw.length - a.kw.length);

  for (const { kw, cat } of allKeywords) {
    if (text.includes(kw)) return cat;
  }
  return null;
}

// ── Extract payment method ────────────────────────────────────────────────────
function extractPayment(text) {
  const map = {
    'gpay': 'UPI', 'google pay': 'UPI', 'phonepe': 'UPI',
    'paytm': 'UPI', 'upi': 'UPI',
    'cash': 'Cash',
    'card': 'Card', 'debit': 'Card', 'credit': 'Card',
    'bank': 'Bank', 'net banking': 'Bank', 'neft': 'Bank',
  };
  for (const [word, method] of Object.entries(map)) {
    if (text.includes(word)) return method;
  }
  return 'Cash'; // default
}

// ── Extract note ──────────────────────────────────────────────────────────────
function extractNote(text, category, amount, payment) {
  let note = text;
  // Remove category keywords
  if (category) {
    category.keywords.forEach(kw => {
      note = note.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
    });
  }
  // Remove amount
  note = note.replace(/\d+(?:\.\d+)?/g, '');
  // Remove payment
  note = note.replace(/\b(cash|upi|card|bank|gpay|phonepe|paytm|rupees?|rs)\b/gi, '');
  return note.replace(/\s+/g, ' ').trim();
}

// ── Main parser ───────────────────────────────────────────────────────────────
export function parseExpense(rawText) {
  if (!rawText) return null;

  const text = normalize(rawText);
  const amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  const category = extractCategory(text);
  if (!category) return null;

  const payment = extractPayment(text);
  const note    = extractNote(text, category, amount, payment);

  return {
    rawText,
    category:      category.key,
    categoryLabel: category.label,
    categoryEmoji: category.emoji,
    categoryColor: category.color,
    amount:        Math.round(amount),
    payment,
    note,
    confidence:    calcConfidence(rawText, category, amount),
  };
}

// ── Confidence score (0-100) ──────────────────────────────────────────────────
function calcConfidence(text, category, amount) {
  let score = 50;
  if (amount > 0)    score += 20;
  if (category)      score += 20;
  if (text.length > 5) score += 10;
  return Math.min(100, score);
}

// ── Smart keyword autocategorize ──────────────────────────────────────────────
export function suggestCategory(text) {
  const t = text.toLowerCase();
  const smart = {
    'swiggy': 'food', 'zomato': 'food', 'blinkit': 'food',
    'petrol': 'personal', 'bunk': 'personal', 'hp': 'personal',
    'amazon': 'others', 'flipkart': 'others',
    'rent': 'rent', 'room': 'rent',
    'ola': 'transport', 'uber': 'transport', 'rapido': 'transport',
    'medical': 'personal', 'pharmacy': 'personal', 'hospital': 'personal',
  };
  for (const [word, cat] of Object.entries(smart)) {
    if (t.includes(word)) return CATEGORIES.find(c => c.key === cat);
  }
  return null;
}
