
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            video: {
              select: {
                id: true,
                slug: true,
                titleRu: true,
                thumbnailUrl: true,
                youtubeUrl: true,
                duration: true
              }
            }
          }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    // Check if user is enrolled
    let enrollment = null;
    let lessonsProgress: any[] = [];
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        enrollment = await prisma.courseEnrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id
            }
          }
        });
        if (enrollment) {
          lessonsProgress = await prisma.lessonProgress.findMany({
            where: {
              userId: user.id,
              lessonId: { in: course.lessons.map(l => l.id) }
            }
          });
        }
      }
    }

    return NextResponse.json({
      course,
      enrollment,
      lessonsProgress
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
