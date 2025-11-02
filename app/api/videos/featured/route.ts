
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const featuredVideos = await prisma.video.findMany({
      where: {
        featured: true
      },
      include: {
        category: {
          select: {
            titleRu: true,
            emoji: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    })

    return NextResponse.json(featuredVideos)
  } catch (error) {
    console.error('Error fetching featured videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured videos' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
