
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });
    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Подписка не найдена' },
        { status: 404 }
      );
    }

    // Динамическое получение origin из заголовков
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Создание Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Ошибка создания Portal Session:', error);
    return NextResponse.json(
      { error: 'Не удалось создать портал управления подпиской' },
      { status: 500 }
    );
  }
}
