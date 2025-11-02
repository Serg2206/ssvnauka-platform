
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { completed, watchedSeconds } = await request.json();
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: { course: true }
    });
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check old progress before update
    const oldProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.lessonId
        }
      }
    });

    // Update or create lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.lessonId
        }
      },
      update: {
        completed: completed || false,
        watchedSeconds: watchedSeconds || 0
      },
      create: {
        userId: user.id,
        lessonId: params.lessonId,
        completed: completed || false,
        watchedSeconds: watchedSeconds || 0
      }
    });

    // Update course enrollment progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId }
    });
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        lesson: { courseId: lesson.courseId },
        completed: true
      }
    });
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: lesson.courseId
        }
      },
      update: {
        progress: progressPercentage,
        completedAt: progressPercentage === 100 ? new Date() : null
      },
      create: {
        userId: user.id,
        courseId: lesson.courseId,
        progress: progressPercentage
      }
    });

    // Award XP for lesson completion (only if not previously completed)
    const wasNotCompleted = !oldProgress || !oldProgress.completed;
    let xpAwarded = 0;
    if (completed && wasNotCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: lesson.xpReward || 0 }
        }
      });
      xpAwarded = lesson.xpReward || 0;
    }

    return NextResponse.json({
      lessonProgress,
      enrollment,
      xpAwarded
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ progress: null });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ progress: null });
    }

    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.lessonId
        }
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
