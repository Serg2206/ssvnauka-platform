
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
  Award,
  CreditCard,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  users: {
    total: number;
    free: number;
    premium: number;
    pro: number;
    admin: number;
  };
  subscriptions: {
    active: number;
    trialing: number;
    canceled: number;
    pastDue: number;
  };
  revenue: {
    mrr: number;
    totalRevenue: number;
    averageRevenuePerUser: number;
  };
  courses: {
    total: number;
    totalEnrollments: number;
    completionRate: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentSubscriptions: Array<{
    id: string;
    userName: string;
    plan: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user && 'role' in session.user && session.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      fetchAdminStats();
    }
  }, [status, session, router]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch admin stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
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

  if (!stats) return null;

  const planNames: Record<string, string> = {
    FREE: 'Free',
    PREMIUM_MONTHLY: 'Premium (мес)',
    PREMIUM_YEARLY: 'Premium (год)',
    PRO_MONTHLY: 'PRO (мес)',
    PRO_YEARLY: 'PRO (год)',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Аналитика и статистика платформы
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="revenue">Доходы</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
                  <Users className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-gray-500">
                    {stats.users.premium + stats.users.pro} платных
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.mrr.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">ежемесячный доход</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
                  <UserCheck className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.subscriptions.active}</div>
                  <p className="text-xs text-gray-500">
                    +{stats.subscriptions.trialing} trial
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.averageRevenuePerUser.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">средний доход на пользователя</p>
                </CardContent>
              </Card>
            </div>

            {/* User Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Распределение пользователей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Free</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stats.users.free}</Badge>
                        <span className="text-sm text-gray-500">
                          {((stats.users.free / stats.users.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">{stats.users.premium}</Badge>
                        <span className="text-sm text-gray-500">
                          {((stats.users.premium / stats.users.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PRO</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">{stats.users.pro}</Badge>
                        <span className="text-sm text-gray-500">
                          {((stats.users.pro / stats.users.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статус подписок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Активные</span>
                      <Badge className="bg-green-500">{stats.subscriptions.active}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Пробный период</span>
                      <Badge className="bg-blue-500">{stats.subscriptions.trialing}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Отменены</span>
                      <Badge variant="outline">{stats.subscriptions.canceled}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Просрочены</span>
                      <Badge variant="destructive">{stats.subscriptions.pastDue}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Последние подписки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentSubscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{sub.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sub.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{planNames[sub.plan]}</Badge>
                        <Badge
                          variant={
                            sub.status === 'ACTIVE'
                              ? 'default'
                              : sub.status === 'TRIALING'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Последние пользователи</CardTitle>
                <CardDescription>Новые регистрации на платформе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.role === 'PRO'
                            ? 'default'
                            : user.role === 'PREMIUM'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>MRR</CardTitle>
                  <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${stats.revenue.mrr.toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-2">ежемесячный регулярный доход</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Общий доход</CardTitle>
                  <CardDescription>Весь период</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${stats.revenue.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">за все время</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ARPU</CardTitle>
                  <CardDescription>Average Revenue Per User</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${stats.revenue.averageRevenuePerUser.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">средний доход на пользователя</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Прогноз годового дохода</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  ${(stats.revenue.mrr * 12).toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  При текущем MRR (${stats.revenue.mrr.toLocaleString()}/мес)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
