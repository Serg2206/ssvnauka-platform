
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const where: any = { published: true };
    if (level) where.level = level;
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.featured = true;
    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, order: true }
        },
        _count: {
          select: { enrollments: true, lessons: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
