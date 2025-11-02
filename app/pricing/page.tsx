
'use client';

import { useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Crown, Star, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

type BillingInterval = 'monthly' | 'yearly';

function PricingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const canceled = searchParams.get('canceled');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Начните обучение бесплатно',
      icon: Star,
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: '20% видео контента', included: true },
        { text: 'Базовые курсы', included: true },
        { text: 'Доступ к блогу', included: true },
        { text: 'Сертификаты', included: false },
        { text: 'Скачивание материалов', included: false },
        { text: 'Персональные консультации', included: false },
        { text: 'Приоритетная поддержка', included: false },
      ],
      cta: 'Текущий план',
      popular: false,
      stripeKey: null,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Полный доступ к обучающим материалам',
      icon: Zap,
      price: { monthly: 39, yearly: 390 },
      features: [
        { text: '100% видео контента', included: true },
        { text: 'Все курсы без ограничений', included: true },
        { text: 'Без рекламы', included: true },
        { text: 'Скачивание материалов', included: true },
        { text: 'Сертификаты о прохождении', included: true },
        { text: 'Персональные консультации', included: false },
        { text: 'Приоритетная поддержка', included: true },
      ],
      cta: 'Начать Premium',
      popular: true,
      stripeKey: 'premium',
      discount: '17% скидка при годовой оплате',
    },
    {
      id: 'pro',
      name: 'PRO',
      description: 'Для профессионалов с индивидуальной поддержкой',
      icon: Crown,
      price: { monthly: 99, yearly: 990 },
      features: [
        { text: 'Все из Premium +', included: true },
        { text: 'Персональные консультации (1 час/мес)', included: true },
        { text: 'Эксклюзивные вебинары', included: true },
        { text: 'Закрытое комьюнити', included: true },
        { text: 'Ранний доступ к материалам', included: true },
        { text: 'Персональный менеджер', included: true },
        { text: 'Кастомные программы обучения', included: true },
      ],
      cta: 'Начать PRO',
      popular: false,
      stripeKey: 'pro',
      discount: '17% скидка при годовой оплате',
    },
  ];

  const handleSubscribe = async (planKey: string | null) => {
    if (!planKey) return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    try {
      setLoading(planKey);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: `${planKey}_${interval}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания сессии оплаты');
      }

      // Редирект на Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      alert(error.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Выберите свой план обучения
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Профессиональное хирургическое образование от ведущих специалистов
          </p>

          {/* Trial Banner */}
          <div className="mt-8 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            14 дней бесплатно для всех платных планов
          </div>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                interval === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                interval === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Ежегодно
              <Badge className="ml-2 bg-green-500 text-white text-xs">Экономия 17%</Badge>
            </button>
          </div>
        </div>

        {/* Canceled Alert */}
        {canceled && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Оплата была отменена. Вы можете попробовать снова в любое время.
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = plan.price[interval];
            const isLoading = loading === plan.stripeKey;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-blue-500 dark:border-blue-400 shadow-xl scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Самый популярный
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-8 h-8 ${
                      plan.id === 'pro' ? 'text-purple-500' : 
                      plan.id === 'premium' ? 'text-blue-500' : 
                      'text-gray-500'
                    }`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">${price}</span>
                      {price > 0 && (
                        <span className="text-gray-500 ml-2">
                          /{interval === 'monthly' ? 'мес' : 'год'}
                        </span>
                      )}
                    </div>
                    {plan.discount && interval === 'yearly' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {plan.discount}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? '' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {plan.id === 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      {session ? 'Текущий план' : 'Бесплатно'}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100'
                      }`}
                      onClick={() => handleSubscribe(plan.stripeKey)}
                      disabled={isLoading || status === 'loading'}
                    >
                      {isLoading ? 'Загрузка...' : plan.cta}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* B2B CTA */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <CardHeader>
              <CardTitle className="text-3xl">Корпоративные лицензии</CardTitle>
              <CardDescription className="text-purple-100">
                Обучение для всей команды хирургов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Что включено:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      До 100+ пользователей
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Аналитика обучения сотрудников
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Кастомные курсы под клинику
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Выделенный менеджер
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Подходит для:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>🏥 Частные клиники</li>
                    <li>🏛️ Медицинские университеты</li>
                    <li>🏥 Государственные больницы</li>
                    <li>👥 Медицинские ассоциации</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/b2b" className="w-full">
                <Button variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100">
                  Узнать больше о корпоративных лицензиях
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Часто задаваемые вопросы</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Можно ли отменить подписку в любое время?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Да, вы можете отменить подписку в любой момент через личный кабинет. Доступ сохранится до конца оплаченного периода.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Как работает пробный период?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Все платные планы включают 14 дней бесплатного доступа. Оплата начнется только после окончания пробного периода.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Можно ли перейти на другой план?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Да, вы можете повысить или понизить тариф в любое время. Изменения вступят в силу в следующем платежном цикле.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
