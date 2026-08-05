import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CartItem,
  Product,
  ProductInventoryPayload,
  ProductVariant,
} from '@/lib/types';

export interface CartMutationResult {
  success: boolean;
  availableStock: number | null;
}

export function getInventoryAvailableStock(
  inventoryPayload?: ProductInventoryPayload,
): number | null {
  const inventory = Array.isArray(inventoryPayload)
    ? inventoryPayload[0]
    : inventoryPayload;

  if (!inventory) return 0;
  return Math.max(0, (inventory.quantity ?? 0) - (inventory.reserved ?? 0));
}

export function getVariantAvailableStock(
  variant?: ProductVariant | null,
): number | null {
  if (!variant) return null;
  return getInventoryAvailableStock(variant.inventory);
}

export function getCartItemAvailableStock(item: CartItem): number | null {
  return item.variant
    ? getVariantAvailableStock(item.variant)
    : getInventoryAvailableStock(item.product.inventory);
}

interface CartState {
  isCartOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: Product,
    variant?: ProductVariant | null,
    qty?: number,
  ) => CartMutationResult;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => CartMutationResult;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isCartOpen: false,
      items: [],

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product: Product, variant?: ProductVariant | null, qty = 1) => {
        const state = get();
        const existingIdx = state.items.findIndex(
          (item) =>
            item.productId === product.id &&
            item.variantId === (variant?.id ?? null),
        );
        const availableStock = variant
          ? getVariantAvailableStock(variant)
          : getInventoryAvailableStock(product.inventory);
        const requestedQuantity =
          (existingIdx >= 0 ? state.items[existingIdx].quantity : 0) + qty;

        if (
          !Number.isInteger(qty) ||
          qty < 1 ||
          (availableStock !== null && requestedQuantity > availableStock)
        ) {
          return { success: false, availableStock };
        }

        if (existingIdx >= 0) {
          const updated = [...state.items];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: requestedQuantity,
            variant: variant ?? updated[existingIdx].variant,
          };
          set({ items: updated, isCartOpen: true });
          return { success: true, availableStock };
        }

        const newItem: CartItem = {
          id: `${product.id}-${variant?.id ?? 'no-variant'}-${Date.now()}`,
          cartId: 'local',
          productId: product.id,
          variantId: variant?.id ?? null,
          quantity: qty,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            basePrice: product.basePrice,
            images: product.images,
            inventory: product.inventory,
          },
          variant: variant ?? null,
        };

        set({ items: [...state.items, newItem], isCartOpen: true });
        return { success: true, availableStock };
      },

      removeItem: (itemId: string) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return { success: true, availableStock: null };
        }

        const state = get();
        const item = state.items.find((current) => current.id === itemId);
        if (!item || !Number.isInteger(quantity)) {
          return { success: false, availableStock: null };
        }

        const availableStock = getCartItemAvailableStock(item);
        if (availableStock !== null && quantity > availableStock) {
          return { success: false, availableStock };
        }

        set({
          items: state.items.map((current) =>
            current.id === itemId ? { ...current, quantity } : current,
          ),
        });
        return { success: true, availableStock };
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const price = Number(item.variant?.price ?? item.product.basePrice);
          return sum + price * item.quantity;
        }, 0);
      },

      getCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'achromatic-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
