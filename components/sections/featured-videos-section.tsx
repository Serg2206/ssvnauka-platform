
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Clock, Eye, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import Link from 'next/link'

interface FeaturedVideo {
  id: string
  slug: string
  titleRu: string
  description: string
  duration: string
  channel: string
  youtubeUrl: string
  viewCount?: string
  thumbnailUrl?: string
  category: {
    titleRu: string
    emoji: string
  }
}

async function getFeaturedVideos(): Promise<FeaturedVideo[]> {
  try {
    const response = await fetch('/api/videos/featured')
    if (!response.ok) {
      console.error('Failed to fetch featured videos:', response.status)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching featured videos:', error)
    return []
  }
}

export function FeaturedVideosSection() {
  const [videos, setVideos] = useState<FeaturedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    getFeaturedVideos().then((data) => {
      setVideos(data || [])
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
      <section className="py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Загрузка видео...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <CardContent className="p-6">
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
    <section ref={ref} className="py-20 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="text-blue-600">Рекомендуемые</span> видеоуроки
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Лучшие образовательные материалы от ведущих хирургов и медицинских центров мира
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {videos?.slice(0, 6)?.map((video, index) => (
          <motion.div key={video?.id || `video-${index}`} variants={item}>
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <div className="relative aspect-video overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Play className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-16 h-16 text-white" />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-black/50 text-white border-0">
                    {video?.category?.emoji || '🏥'} {video?.category?.titleRu || 'Медицина'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/50 text-white border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {video?.duration || 'N/A'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video?.titleRu || 'Загрузка...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {video?.channel || 'Неизвестный канал'}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {video?.description || 'Описание загружается...'}
                </p>

                <div className="flex items-center justify-between">
                  {video?.viewCount && (
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
          </motion.div>
        )) || []}
      </motion.div>

      {videos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Видео не найдены. Попробуйте обновить страницу.
          </p>
        </div>
      )}
    </section>
  )
}
