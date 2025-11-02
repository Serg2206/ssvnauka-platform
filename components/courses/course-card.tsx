
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Award, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: {
    slug: string;
    titleRu: string;
    shortDescription?: string | null;
    thumbnailUrl?: string | null;
    duration?: string | null;
    level: string;
    isPremium: boolean;
    price?: number | null;
    featured: boolean;
    _count: {
      enrollments: number;
      lessons: number;
    };
  };
}

const levelLabels: { [key: string]: string } = {
  BEGINNER: 'Начальный',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
  EXPERT: 'Эксперт'
};

const levelColors: { [key: string]: string } = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADVANCED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <Link href={`/courses/${course.slug}`}>
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.titleRu}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {course.featured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                ⭐ Популярный
              </Badge>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge className={levelColors[course.level] || ''}>
            {levelLabels[course.level] || course.level}
          </Badge>
          {course.isPremium && (
            <Badge variant="secondary">
              <Award className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <CardTitle className="mb-2 line-clamp-2">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.titleRu}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.shortDescription || 'Профессиональный курс для специалистов'}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course._count.lessons} уроков</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course._count.enrollments}</span>
          </div>
        </div>
        {course.isPremium && course.price ? (
          <span className="font-bold text-primary">{course.price}₽</span>
        ) : (
          <span className="font-bold text-green-600">Бесплатно</span>
        )}
      </CardFooter>
    </Card>
  );
}
