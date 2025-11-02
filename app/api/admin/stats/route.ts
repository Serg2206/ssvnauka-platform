
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch user statistics
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      proUsers,
      adminUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'PREMIUM' } }),
      prisma.user.count({ where: { role: 'PRO' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    // Fetch subscription statistics
    const [
      activeSubscriptions,
      trialingSubscriptions,
      canceledSubscriptions,
      pastDueSubscriptions,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'TRIALING' } }),
      prisma.subscription.count({ where: { status: 'CANCELED' } }),
      prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
    ]);

    // Calculate revenue
    const purchases = await prisma.purchase.findMany({
      where: { status: 'SUCCEEDED' },
    });
    const totalRevenue = purchases.reduce((sum: number, p: any) => sum + p.amount, 0) / 100;

    // Calculate MRR (Monthly Recurring Revenue)
    const activeMonthlySubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        plan: { in: ['PREMIUM_MONTHLY', 'PRO_MONTHLY'] },
      },
    });

    const activeYearlySubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        plan: { in: ['PREMIUM_YEARLY', 'PRO_YEARLY'] },
      },
    });

    const monthlyMRR = activeMonthlySubscriptions.reduce((sum: number, sub: any) => {
      if (sub.plan === 'PREMIUM_MONTHLY') return sum + 39;
      if (sub.plan === 'PRO_MONTHLY') return sum + 99;
      return sum;
    }, 0);

    const yearlyMRR = activeYearlySubscriptions.reduce((sum: number, sub: any) => {
      if (sub.plan === 'PREMIUM_YEARLY') return sum + 390 / 12;
      if (sub.plan === 'PRO_YEARLY') return sum + 990 / 12;
      return sum;
    }, 0);
    const mrr = Math.round(monthlyMRR + yearlyMRR);
    const arpu = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Fetch recent subscriptions
    const recentSubscriptions = await prisma.subscription.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch course statistics
    const totalCourses = await prisma.course.count();
    const enrollments = await prisma.courseEnrollment.count();
    const completedLessons = await prisma.lessonProgress.count({
      where: { completed: true },
    });
    const totalLessons = await prisma.lesson.count();
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    return NextResponse.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        premium: premiumUsers,
        pro: proUsers,
        admin: adminUsers,
      },
      subscriptions: {
        active: activeSubscriptions,
        trialing: trialingSubscriptions,
        canceled: canceledSubscriptions,
        pastDue: pastDueSubscriptions,
      },
      revenue: {
        mrr,
        totalRevenue: Math.round(totalRevenue),
        averageRevenuePerUser: Math.round(arpu),
      },
      courses: {
        total: totalCourses,
        totalEnrollments: enrollments,
        completionRate: Math.round(completionRate),
      },
      recentUsers,
      recentSubscriptions: recentSubscriptions.map((sub: any) => ({
        id: sub.id,
        userName: sub.user.name,
        plan: sub.plan,
        status: sub.status,
        createdAt: sub.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
