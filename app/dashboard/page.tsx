
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  Award,
  CreditCard,
  Settings,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardData {
  user: {
    name: string;
    email: string;
    xp: number;
    level: number;
    role: string;
  };
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEndsAt: string | null;
  } | null;
  stats: {
    enrolledCourses: number;
    completedLessons: number;
    totalLessons: number;
    certificates: number;
  };
  activeCourses: Array<{
    id: string;
    title: string;
    slug: string;
    progress: number;
    lastViewedAt: string;
    completedLessons: number;
    totalLessons: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
  purchases: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get('success');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  useEffect(() => {
    if (success === 'true') {
      toast.success('Подписка успешно оформлена! Добро пожаловать в Premium!');
      // Remove success param from URL
      router.replace('/dashboard');
    }
  }, [success, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Не удалось открыть портал управления подпиской');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, subscription, stats, activeCourses, recentActivity, purchases } = data;

  // Calculate progress to next level (100 XP per level)
  const xpForNextLevel = (user.level + 1) * 100;
  const xpProgress = (user.xp / xpForNextLevel) * 100;

  const planNames: Record<string, string> = {
    FREE: 'Free',
    PREMIUM_MONTHLY: 'Premium (ежемесячно)',
    PREMIUM_YEARLY: 'Premium (ежегодно)',
    PRO_MONTHLY: 'PRO (ежемесячно)',
    PRO_YEARLY: 'PRO (ежегодно)',
  };

  const statusBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    ACTIVE: { label: 'Активна', variant: 'default' },
    TRIALING: { label: 'Пробный период', variant: 'secondary' },
    CANCELED: { label: 'Отменена', variant: 'destructive' },
    PAST_DUE: { label: 'Просрочена', variant: 'destructive' },
    INCOMPLETE: { label: 'Неполная', variant: 'outline' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ваш прогресс и статистика обучения
          </p>
        </div>

        {/* Subscription Alert */}
        {subscription?.trialEndsAt && subscription.status === 'TRIALING' && (
          <Card className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Пробный период активен
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Ваш пробный период истекает{' '}
                    {new Date(subscription.trialEndsAt).toLocaleDateString('ru-RU')}. 
                    Наслаждайтесь всеми функциями Premium!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="courses">Мои курсы</TabsTrigger>
            <TabsTrigger value="subscription">Подписка</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Уровень</CardTitle>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.level}</div>
                  <Progress value={xpProgress} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {user.xp} / {xpForNextLevel} XP
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Курсы</CardTitle>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
                  <p className="text-xs text-gray-500">активных курсов</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Уроки</CardTitle>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedLessons}</div>
                  <p className="text-xs text-gray-500">
                    из {stats.totalLessons} завершено
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Сертификаты</CardTitle>
                  <Award className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.certificates}</div>
                  <p className="text-xs text-gray-500">получено</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Активные курсы</CardTitle>
                <CardDescription>Продолжите обучение с того места, где остановились</CardDescription>
              </CardHeader>
              <CardContent>
                {activeCourses.length > 0 ? (
                  <div className="space-y-4">
                    {activeCourses.map((course) => (
                      <Link key={course.id} href={`/courses/${course.slug}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{course.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{course.completedLessons} / {course.totalLessons} уроков</span>
                              <span>•</span>
                              <span>Обновлено {new Date(course.lastViewedAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <Progress value={course.progress} className="mt-2" />
                          </div>
                          <Button variant="ghost" size="sm">
                            Продолжить
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      У вас пока нет активных курсов
                    </p>
                    <Link href="/courses">
                      <Button>Начать обучение</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Последняя активность</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Пока нет активности
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Мои курсы</CardTitle>
                <CardDescription>Все курсы, в которых вы зарегистрированы</CardDescription>
              </CardHeader>
              <CardContent>
                {activeCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeCourses.map((course) => (
                      <Link key={course.id} href={`/courses/${course.slug}`}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>
                              {course.completedLessons} / {course.totalLessons} уроков завершено
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Progress value={course.progress} />
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {course.progress}% завершено
                              </span>
                              <Button size="sm" variant="outline">
                                Продолжить
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Нет активных курсов</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Начните свое обучающее путешествие прямо сейчас
                    </p>
                    <Link href="/courses">
                      <Button size="lg">Просмотреть все курсы</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Текущий план</CardTitle>
                <CardDescription>Управление вашей подпиской</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{planNames[subscription.plan]}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Статус: <Badge variant={statusBadges[subscription.status]?.variant}>
                            {statusBadges[subscription.status]?.label}
                          </Badge>
                        </p>
                      </div>
                      <Button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        variant="outline"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {portalLoading ? 'Загрузка...' : 'Управление'}
                      </Button>
                    </div>

                    {subscription.status === 'ACTIVE' && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Следующее списание:{' '}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}
                          </span>
                        </p>
                        {subscription.cancelAtPeriodEnd && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Подписка будет отменена в конце периода</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Бесплатный план</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Обновитесь до Premium для полного доступа ко всем курсам
                    </p>
                    <Link href="/pricing">
                      <Button size="lg">
                        Посмотреть тарифы
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>История платежей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">
                            {purchase.currency} {(purchase.amount / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(purchase.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Badge variant={purchase.status === 'SUCCEEDED' ? 'default' : 'destructive'}>
                          {purchase.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
