
'use client'

import { Button } from '@/components/ui/button'
import { Play, ArrowRight, Users, Video, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const stats = [
  { label: 'Видеоуроков', value: '700+', icon: Video },
  { label: 'Хирургов обучено', value: '50,000+', icon: Users },
  { label: 'Медицинских центров', value: '200+', icon: Award },
]

export function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    SSVproff
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 mt-4">
                  Платформа хирургического образования
                </p>
              </motion.div>
              
              <motion.p 
                className="text-lg text-slate-300 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Профессиональные образовательные материалы по современной хирургии: лапароскопические техники, 
                роботическая хирургия, эндоскопические процедуры и минимально инвазивные методы.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    const categoriesSection = document.getElementById('categories')
                    categoriesSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Начать обучение
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-400 text-blue-100 hover:bg-blue-900"
                  onClick={() => {
                    const aboutSection = document.querySelector('#about') || document.querySelector('[data-section="about"]')
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      // Scroll to stats section as an alternative "about" section
                      const statsSection = document.querySelector('.py-20.bg-gradient-to-br')
                      statsSection?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  Узнать больше
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-1">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                <Play className="w-20 h-20 text-blue-400" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-70 blur-xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full opacity-50 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
