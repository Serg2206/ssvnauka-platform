
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { prisma } from '@/lib/db';
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    const { plan } = await request.json();
    // Валидация плана
    const validPlans = [
      'premium_monthly',
      'premium_yearly',
      'pro_monthly',
      'pro_yearly',
    ];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Недействительный план' },
        { status: 400 }
      );
    }

    // Получение пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка активной подписки
    if (
      user.subscription?.status === 'ACTIVE' ||
      user.subscription?.status === 'TRIALING'
    ) {
      return NextResponse.json(
        { error: 'У вас уже есть активная подписка. Используйте портал для управления.' },
        { status: 400 }
      );
    }

    // Получение Price ID
    const [tier, interval] = plan.split('_');
    const priceConfig = STRIPE_CONFIG.products[tier as 'premium' | 'pro'][
      interval as 'monthly' | 'yearly'
    ];
    if (!priceConfig.priceId) {
      return NextResponse.json(
        { error: 'Цена не настроена. Пожалуйста, настройте Stripe.' },
        { status: 500 }
      );
    }
    // Создание или получение Stripe Customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Динамическое получение origin из заголовков
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Создание Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          plan,
        },
        trial_period_days: 14, // 14 дней бесплатно
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Ошибка создания Checkout Session:', error);
    return NextResponse.json(
      { error: 'Не удалось создать сессию оплаты', details: error.message },
      { status: 500 }
    );
  }
}
