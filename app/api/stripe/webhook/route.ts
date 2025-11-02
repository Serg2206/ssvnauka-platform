
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Отсутствует подпись webhook' },
      { status: 400 }
    );
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET не установлен');
    return NextResponse.json(
      { error: 'Webhook не настроен' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Ошибка валидации webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Обработка различных событий
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }
      default:
        console.log(`Необработанное событие: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Ошибка обработки webhook:', error);
    return NextResponse.json(
      { error: 'Ошибка обработки webhook' },
      { status: 500 }
    );
  }
}
// Обработчики событий
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('UserId не найден в metadata сессии');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  // Обновление или создание подписки
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'TRIALING',
      plan: session.metadata?.plan as any || 'FREE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 дней
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'TRIALING',
      plan: session.metadata?.plan as any || 'FREE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  // Обновление роли пользователя
  const plan = session.metadata?.plan;
  const role = plan?.startsWith('pro') ? 'PRO' : plan?.startsWith('premium') ? 'PREMIUM' : 'USER';
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  console.log(`✅ Checkout завершен для пользователя ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Поиск по customerId
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!existingSubscription) {
      console.error('Не удалось найти подписку по customerId');
      return;
    }
    await updateSubscriptionInDb(existingSubscription.userId, subscription);
  } else {
    await updateSubscriptionInDb(userId, subscription);
  }
}

async function updateSubscriptionInDb(
  userId: string,
  subscription: Stripe.Subscription
) {
  const status = mapStripeStatus(subscription.status);
  const plan = subscription.metadata?.plan;
  const subAny = subscription as any;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      status,
      plan: plan as any || 'FREE',
      currentPeriodStart: new Date((subAny.current_period_start || 0) * 1000),
      currentPeriodEnd: new Date((subAny.current_period_end || 0) * 1000),
      cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
      trialEndsAt: subAny.trial_end
        ? new Date(subAny.trial_end * 1000)
        : null,
    },
    update: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      status,
      plan: plan as any || 'FREE',
      currentPeriodStart: new Date((subAny.current_period_start || 0) * 1000),
      currentPeriodEnd: new Date((subAny.current_period_end || 0) * 1000),
      cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
      trialEndsAt: subAny.trial_end
        ? new Date(subAny.trial_end * 1000)
        : null,
    },
  });

  if (status === 'ACTIVE' || status === 'TRIALING') {
    const role = plan?.startsWith('pro') ? 'PRO' : plan?.startsWith('premium') ? 'PREMIUM' : 'USER';
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  console.log(`✅ Подписка обновлена для пользователя ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error('Подписка не найдена при удалении');
    return;
  }

  // Обновление статуса
  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: { status: 'CANCELED' },
  });

  // Возврат к FREE роли
  await prisma.user.update({
    where: { id: existingSubscription.userId },
    data: { role: 'USER' },
  });

  console.log(
    `✅ Подписка отменена для пользователя ${existingSubscription.userId}`
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceAny = invoice as any;
  const customerId = invoice.customer as string;
  const subscriptionId = invoiceAny.subscription as string;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.error('Подписка не найдена для оплаченного счета');
    return;
  }

  // Создание записи о покупке
  await prisma.purchase.create({
    data: {
      userId: subscription.userId,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      stripePaymentId: (invoiceAny.payment_intent as string) || invoice.id,
      status: 'SUCCEEDED',
    },
  });

  console.log(`✅ Счет оплачен для пользователя ${subscription.userId}`);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const invoiceAny = invoice as any;
  const subscriptionId = invoiceAny.subscription as string;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) return;

  // Обновление статуса подписки
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'PAST_DUE' },
  });

  console.log(
    `⚠️ Оплата счета не удалась для пользователя ${subscription.userId}`
  );
}
// Маппинг статусов Stripe на наши статусы
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'PAST_DUE' | 'TRIALING' {
  const statusMap: Record<
    Stripe.Subscription.Status,
    'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'PAST_DUE' | 'TRIALING'
  > = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'PAST_DUE',
    paused: 'CANCELED',
  };
  return statusMap[stripeStatus] || 'CANCELED';
}
