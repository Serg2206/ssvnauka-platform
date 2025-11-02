
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: {
    id: string;
    slug: string;
    titleRu: string;
    description?: string | null;
    order: number;
    duration?: string | null;
    isFree: boolean;
    xpReward: number;
    video?: {
      youtubeUrl: string;
    } | null;
  };
  isCompleted?: boolean;
  isEnrolled?: boolean;
  onPlay?: () => void;
}

export function LessonItem({ lesson, isCompleted = false, isEnrolled = false, onPlay }: LessonItemProps) {
  const canAccess = lesson.isFree || isEnrolled;

  return (
    <Card className={cn(
      'p-4 transition-all hover:shadow-md',
      isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950'
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : canAccess ? (
            <Circle className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                {lesson.order}. {lesson.titleRu}
              </h3>
              {lesson.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {lesson.duration && (
                  <Badge variant="outline" className="text-xs">
                    {lesson.duration}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  +{lesson.xpReward} XP
                </Badge>
                {lesson.isFree && (
                  <Badge className="bg-green-600 text-white text-xs">
                    Бесплатно
                  </Badge>
                )}
              </div>
            </div>
            
            {canAccess && onPlay && (
              <Button
                onClick={onPlay}
                size="sm"
                className="flex-shrink-0"
              >
                <Play className="mr-2 h-4 w-4" />
                {isCompleted ? 'Пересмотреть' : 'Начать'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
