
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY не установлен. Платежи не будут работать.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Конфигурация продуктов и цен
export const STRIPE_CONFIG = {
  products: {
    premium: {
      monthly: {
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
        amount: 3900, // $39.00
        interval: 'month' as const,
      },
      yearly: {
        priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
        amount: 39000, // $390.00 (17% discount)
        interval: 'year' as const,
      },
    },
    pro: {
      monthly: {
        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
        amount: 9900, // $99.00
        interval: 'month' as const,
      },
      yearly: {
        priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
        amount: 99000, // $990.00 (17% discount)
        interval: 'year' as const,
      },
    },
  },
};

// Проверка конфигурации Stripe
export const isStripeConfigured = (): boolean => {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  );
};
