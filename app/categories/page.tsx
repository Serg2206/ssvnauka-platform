
import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

interface Category {
  id: string
  slug: string
  titleRu: string
  description: string
  emoji: string
  videos: any[]
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store'
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Все <span className="text-blue-600">категории</span> обучения
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Полный каталог образовательных материалов по современной хирургии от ведущих медицинских центров мира
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{category.emoji}</div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {category.videos?.length || 0} видео
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {category.titleRu}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    asChild
                    className="w-full group-hover:bg-blue-600 transition-colors"
                    variant="outline"
                  >
                    <Link href={category?.slug ? `/category/${category.slug}` : '/categories'}>
                      <Play className="w-4 h-4 mr-2" />
                      Смотреть видео
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Категории не найдены. Попробуйте обновить страницу.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
