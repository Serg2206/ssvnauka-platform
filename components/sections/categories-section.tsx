
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

interface Category {
  id: string
  slug: string
  titleRu: string
  description: string
  emoji: string
  imageUrl: string
  videos: any[]
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data || [])
      setLoading(false)
    })
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Загрузка категорий...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} id="categories" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Категории <span className="text-blue-600">образовательных материалов</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Изучайте современные хирургические техники с ведущими специалистами мировых медицинских центров
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {categories?.slice(0, 6)?.map((category, index) => (
          <motion.div key={category?.id || `category-${index}`} variants={item}>
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{category?.emoji || '🏥'}</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {category?.videos?.length || 0} видео
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {category?.titleRu || 'Загрузка...'}
                </CardTitle>
                <CardDescription className="text-base">
                  {category?.description || 'Описание загружается...'}
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
          </motion.div>
        )) || []}
      </motion.div>

      {categories?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Категории не найдены. Попробуйте обновить страницу.
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center mt-12"
      >
        <Button asChild size="lg" variant="outline">
          <Link href="/categories">
            Все категории
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}
