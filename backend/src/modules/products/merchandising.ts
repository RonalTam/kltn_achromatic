export enum MerchandisingSection {
  NEW_ARRIVALS = 'new-arrivals',
  BEST_SELLERS = 'best-sellers',
}

export const MERCHANDISING_LIMIT_MAX = 12;
export const MERCHANDISING_DEFAULT_LIMIT = 8;

export const MERCHANDISING_SECTION_CONFIG = {
  [MerchandisingSection.NEW_ARRIVALS]: {
    responseKey: 'newArrivals',
    settingKey: 'homepage_new_arrival_products',
    settingLabel: 'Homepage new arrivals',
    flag: 'isNewArrival',
    fallbackSort: 'createdAt',
  },
  [MerchandisingSection.BEST_SELLERS]: {
    responseKey: 'bestSellers',
    settingKey: 'homepage_best_seller_products',
    settingLabel: 'Homepage best sellers',
    flag: 'isBestSeller',
    fallbackSort: 'soldCount',
  },
} as const;

export type MerchandisingSettingValue = {
  productIds: string[];
  limit: number;
};

export type MerchandisingSource = 'manual' | 'fallback';
