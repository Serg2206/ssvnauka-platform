import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Clock, Eye, ExternalLink, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { prisma } from '@/lib/db'

async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Категория не найдена</h1>
            <p className="text-muted-foreground mb-8">Категория "{params.slug}" не существует.</p>
            <Button asChild>
              <Link href="/categories">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к категориям
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/categories">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Все категории
              </Link>
            </Button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">{category.emoji}</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {category.titleRu}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {category.description}
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-lg px-4 py-2">
                {category.videos?.length || 0} видеоуроков
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.videos?.map((video) => (
              <Card key={video.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                <div className="relative aspect-video overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Play className="w-12 h-12 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {video.titleRu}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {video.channel}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between">
                    {video.viewCount && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        {video.viewCount}
                      </div>
                    )}
                    <Button 
                      asChild 
                      size="sm" 
                      className="ml-auto"
                    >
                      <Link 
                        href={video?.youtubeUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Смотреть
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>

          {(!category.videos || category.videos.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                В этой категории пока нет видео.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true }
    })
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}
