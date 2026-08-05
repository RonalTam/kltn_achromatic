// Formatting utilities

export function formatPrice(price: number | string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(Number(price))
    .replace(/\s?₫/, '₫');
}

export function formatPriceShort(price: number | string): string {
  const num = Number(price);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M₫`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K₫`;
  }
  return `${num}₫`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDiscountPercent(base: number | string, compare: number | string): number {
  const b = Number(base);
  const c = Number(compare);
  if (!c || c <= b) return 0;
  return Math.round(((c - b) / c) * 100);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
