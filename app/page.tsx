
import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/hero-section'
import { CategoriesSection } from '@/components/sections/categories-section'
import { FeaturedVideosSection } from '@/components/sections/featured-videos-section'
import { StatsSection } from '@/components/sections/stats-section'
import { ContactSection } from '@/components/sections/contact-section'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div>Загрузка...</div>}>
            <CategoriesSection />
          </Suspense>
          <Suspense fallback={<div>Загрузка...</div>}>
            <FeaturedVideosSection />
          </Suspense>
          <StatsSection />
          <ContactSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
