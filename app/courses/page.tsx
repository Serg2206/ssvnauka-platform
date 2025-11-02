
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { prisma } from '@/lib/db';
import { CourseCard } from '@/components/courses/course-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      category: true,
      _count: {
        select: { enrollments: true, lessons: true }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  });
  
  return courses;
}

function CoursesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-0">
            <Skeleton className="aspect-video w-full rounded-t-lg" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function CoursesContent() {
  const courses = await getCourses();
  
  const featuredCourses = courses.filter(c => c.featured);
  const regularCourses = courses.filter(c => !c.featured);
  
  return (
    <div className="space-y-12">
      {featuredCourses.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold">⭐ Популярные курсы</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
      
      <section>
        <h2 className="mb-6 text-2xl font-bold">📚 Все курсы</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regularCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      
      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Курсы не найдены</p>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Учебные курсы</h1>
            <p className="text-lg text-muted-foreground">
              Профессиональные программы обучения для специалистов здравоохранения
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense fallback={<CoursesSkeleton />}>
            <CoursesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
