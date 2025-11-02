
'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Video, Users, Award, Clock, BookOpen, Globe } from 'lucide-react'

interface CounterProps {
  from: number
  to: number
  duration?: number
}

function Counter({ from, to, duration = 2 }: CounterProps) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
    })

    const unsubscribe = rounded.onChange((latest) => {
      setDisplayValue(latest)
    })

    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [count, to, rounded, duration])

  return <span>{displayValue.toLocaleString('ru-RU')}</span>
}

const stats = [
  { 
    label: 'Образовательных видео', 
    value: 700, 
    icon: Video,
    suffix: '+',
    description: 'профессиональных видеоуроков'
  },
  { 
    label: 'Хирургов обучено', 
    value: 50000, 
    icon: Users,
    suffix: '+',
    description: 'по всему миру'
  },
  { 
    label: 'Медицинских центров', 
    value: 200, 
    icon: Award,
    suffix: '+',
    description: 'используют нашу платформу'
  },
  { 
    label: 'Часов контента', 
    value: 1200, 
    icon: Clock,
    suffix: '+',
    description: 'качественных материалов'
  },
  { 
    label: 'Категорий обучения', 
    value: 9, 
    icon: BookOpen,
    suffix: '',
    description: 'специализированных направлений'
  },
  { 
    label: 'Стран', 
    value: 85, 
    icon: Globe,
    suffix: '+',
    description: 'где используется SSVproff'
  },
]

export function StatsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <section ref={ref} id="about" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="text-blue-600">SSVproff</span> в цифрах
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Наши достижения в области хирургического образования говорят сами за себя
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={item}
              className="text-center group"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
              </div>
              
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {inView ? (
                  <>
                    <Counter from={0} to={stat.value} />
                    {stat.suffix}
                  </>
                ) : (
                  '0'
                )}
              </div>
              
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {stat.label}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-center mt-16 p-8 bg-white/50 rounded-2xl backdrop-blur-sm"
      >
        <h3 className="text-2xl font-bold mb-4">Присоединяйтесь к глобальному сообществу</h3>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          SSVproff объединяет хирургов со всего мира для обмена знаниями и совершенствования навыков 
          в области современной хирургии. Станьте частью профессионального сообщества!
        </p>
      </motion.div>
    </section>
  )
}
