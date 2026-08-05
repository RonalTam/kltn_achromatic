import type { Product } from '@/lib/types';

export function createProduct(overrides: Partial<Product> = {}): Product {
  const product: Product = {
    id: 'product-1',
    name: 'Áo Sơ Mi Linen Hội An',
    slug: 'ao-so-mi-linen-hoi-an',
    sku: 'LINEN-001',
    basePrice: 399000,
    images: [
      {
        url: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
        altText: 'Áo sơ mi linen màu kem',
        isPrimary: true,
      },
      {
        url: '/vietnam-fashion/ao-thun-saigon.svg',
        altText: 'Mặt sau áo sơ mi linen',
        isPrimary: false,
      },
    ],
    inventory: { quantity: 8, reserved: 1 },
    variants: [],
  };

  return {
    ...product,
    ...overrides,
    images: overrides.images ?? product.images,
    inventory: overrides.inventory ?? product.inventory,
    variants: overrides.variants ?? product.variants,
  };
}
