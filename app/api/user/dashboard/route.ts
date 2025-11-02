
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                category: true,
                lessons: {
                  select: { id: true }
                }
              }
            }
          },
          orderBy: { lastAccessedAt: 'desc' }
        },
        certificates: {
          include: {
            video: {
              select: { titleRu: true, titleEn: true }
            }
          },
          orderBy: { issuedAt: 'desc' }
        }
      }
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get lesson progress stats
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completed: true
      }
    });

    const totalWatchedSeconds = await prisma.lessonProgress.aggregate({
      where: { userId: user.id },
      _sum: { watchedSeconds: true }
    });

    // Get recent activity
    const recentProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id
      },
      include: {
        lesson: {
          select: { titleRu: true, slug: true }
        }
      },
      orderBy: { lastWatchedAt: 'desc' },
      take: 10
    });
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt
      },
      stats: {
        enrolledCourses: user.enrollments.length,
        completedLessons,
        totalWatchTime: Math.floor((totalWatchedSeconds._sum.watchedSeconds || 0) / 60), // minutes
        certificates: user.certificates.length
      },
      enrollments: user.enrollments,
      recentActivity: recentProgress,
      certificates: user.certificates
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
