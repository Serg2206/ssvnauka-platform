
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/courses/progress-bar';
import { LessonItem } from '@/components/courses/lesson-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, BookOpen, Clock, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const levelLabels: { [key: string]: string } = {
  BEGINNER: 'Начальный',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
  EXPERT: 'Эксперт'
};

export default function CoursePage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [lessonsProgress, setLessonsProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchCourse();
  }, [params.slug, session]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.slug}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setCourse(data.course);
      setEnrollment(data.enrollment);
      setLessonsProgress(data.lessonsProgress || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Не удалось загрузить курс');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!session) {
      toast.error('Войдите в систему, чтобы записаться на курс');
      router.push('/auth/signin');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${params.slug}/enroll`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      toast.success('Вы успешно записались на курс!');
      setEnrollment(data.enrollment);
      await fetchCourse();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Не удалось записаться на курс');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePlayLesson = (lessonId: string) => {
    // TODO: Implement video player modal or navigation
    toast.info('Видеоплеер будет реализован в следующей фазе');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="aspect-video w-full rounded-lg mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Курс не найден</h1>
            <Button onClick={() => router.push('/courses')}>
              Вернуться к курсам
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isLessonCompleted = (lessonId: string) => {
    return lessonsProgress.some(p => p.lessonId === lessonId && p.completed);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge>{levelLabels[course.level] || course.level}</Badge>
                  {course.isPremium && (
                    <Badge variant="secondary">
                      <Award className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  {course.category && (
                    <Badge variant="outline">{course.category.emoji} {course.category.titleRu}</Badge>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{course.titleRu}</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {course.shortDescription}
                </p>
                
                {enrollment && (
                  <Card className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Вы записаны на этот курс
                        </span>
                      </div>
                      <ProgressBar value={enrollment.progress} />
                    </CardContent>
                  </Card>
                )}

                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-8">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.titleRu}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1200px) 100vw, 66vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h2>О курсе</h2>
                  <p>{course.description}</p>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{course.lessons.length} уроков</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span>{course._count.enrollments} студентов</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <span>+{course.xpReward} XP за прохождение</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        {course.isPremium && course.price ? (
                          <div className="mb-4">
                            <span className="text-3xl font-bold">{course.price}₽</span>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                              Бесплатно
                            </Badge>
                          </div>
                        )}
                        
                        {!enrollment ? (
                          <Button 
                            onClick={handleEnroll} 
                            disabled={enrolling}
                            className="w-full"
                            size="lg"
                          >
                            {enrolling ? 'Записываемся...' : 'Записаться на курс'}
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full"
                            size="lg"
                          >
                            Перейти к обучению
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold mb-6">📚 Программа курса</h2>
          <div className="space-y-4">
            {course.lessons.map((lesson: any) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isCompleted={isLessonCompleted(lesson.id)}
                isEnrolled={!!enrollment}
                onPlay={() => handlePlayLesson(lesson.id)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
