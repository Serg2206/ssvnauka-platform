
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function createSlug(text: string, suffix?: number): string {
  let slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .trim();
  
  if (suffix) {
    slug += `-${suffix}`;
  }
  
  return slug;
}

function getEmojiForCategory(categoryId: string): string {
  const emojiMap: { [key: string]: string } = {
    'surgical-techniques': '⚔️',
    'laparoscopic-procedures': '🔬',
    'surgeon-training': '👨‍⚕️',
    'medical-instruments': '🔧',
    'operating-methods': '🏥',
    'surgical-anatomy': '🫀',
    'simulation-training': '🥽',
    'endoscopic-techniques': '📹',
    'minimally-invasive-surgery': '🤖'
  };
  return emojiMap[categoryId] || '🏥';
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Read the educational videos catalog
  const catalogPath = path.join(process.cwd(), 'data', 'educational_videos_catalog.json');
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  console.log(`📚 Found ${catalogData.categories.length} categories`);

  // Clear existing data
  await prisma.relatedVideo.deleteMany();
  await prisma.video.deleteMany();
  await prisma.category.deleteMany();
  
  console.log('🗑️ Cleared existing data');

  // Create categories and videos
  for (const categoryData of catalogData.categories) {
    console.log(`📁 Creating category: ${categoryData.name_ru}`);
    
    const category = await prisma.category.create({
      data: {
        slug: categoryData.id,
        titleEn: categoryData.name_en,
        titleRu: categoryData.name_ru,
        description: categoryData.description_ru,
        emoji: getEmojiForCategory(categoryData.id),
        imageUrl: categoryData.image_url,
      },
    });

    console.log(`📺 Adding ${categoryData.videos.length} videos for ${categoryData.name_ru}`);

    // Create videos for this category
    const videos = [];
    for (let i = 0; i < categoryData.videos.length; i++) {
      const videoData = categoryData.videos[i];
      const baseSlug = createSlug(videoData.title_ru);
      const uniqueSlug = `${baseSlug}-${category.slug}-${i + 1}`;
      
      const video = await prisma.video.create({
        data: {
          slug: uniqueSlug,
          titleEn: videoData.title_en,
          titleRu: videoData.title_ru,
          description: videoData.description,
          duration: videoData.duration,
          channel: videoData.channel,
          youtubeUrl: videoData.youtube_url,
          viewCount: videoData.views,
          thumbnailUrl: `https://i.ytimg.com/vi/vx5dSS3BBOk/maxresdefault.jpg`,
          categoryId: category.id,
          featured: Math.random() > 0.7, // Mark some videos as featured
        },
      });
      videos.push(video);
    }

    // Create related videos (connect videos within the same category)
    for (let i = 0; i < videos.length; i++) {
      const relatedVideos = videos.filter((_, index) => index !== i).slice(0, 2); // Max 2 related videos
      
      for (const relatedVideo of relatedVideos) {
        await prisma.relatedVideo.create({
          data: {
            fromId: videos[i].id,
            toId: relatedVideo.id,
          },
        }).catch(() => {}); // Ignore duplicates
      }
    }
  }

  // Create courses from categories
  console.log('🎓 Creating courses...');
  
  const categories = await prisma.category.findMany({
    include: { videos: true }
  });

  const courseDescriptions: { [key: string]: string } = {
    'surgical-techniques': 'Освойте фундаментальные и продвинутые хирургические техники. Этот курс охватывает ключевые методики современной хирургии, от базовых навыков до сложных процедур.',
    'laparoscopic-procedures': 'Полный курс по лапароскопической хирургии с практическими демонстрациями. Изучите все основные лапароскопические процедуры пошагово.',
    'surgeon-training': 'Комплексная программа профессионального развития для хирургов всех уровней. Включает симуляционное обучение и международный опыт.',
    'medical-instruments': 'Научитесь правильно работать с современным хирургическим оборудованием. Курс охватывает инструменты, стерилизацию и техническое обслуживание.',
    'operating-methods': 'Освойте операционные протоколы и методы командной работы. Изучите стандарты безопасности ВОЗ и профилактику инфекций.',
    'surgical-anatomy': 'Углубленное изучение анатомии с хирургической точки зрения. Используйте VR/AR технологии и 3D модели для лучшего понимания.',
    'simulation-training': 'Отработайте навыки на современных симуляторах и в VR. Безопасная среда для тренировки сложных процедур.',
    'endoscopic-techniques': 'Мастер-класс по современным эндоскопическим процедурам. От базовых техник до продвинутых терапевтических вмешательств.',
    'minimally-invasive-surgery': 'Изучите передовые технологии минимально инвазивной хирургии. Роботические системы, NOTES, и микрохирургия.'
  };

  const courseLevels: { [key: string]: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' } = {
    'surgical-techniques': 'BEGINNER',
    'laparoscopic-procedures': 'INTERMEDIATE',
    'surgeon-training': 'INTERMEDIATE',
    'medical-instruments': 'BEGINNER',
    'operating-methods': 'BEGINNER',
    'surgical-anatomy': 'INTERMEDIATE',
    'simulation-training': 'ADVANCED',
    'endoscopic-techniques': 'ADVANCED',
    'minimally-invasive-surgery': 'EXPERT'
  };

  for (const category of categories) {
    if (category.videos.length === 0) continue;

    const course = await prisma.course.create({
      data: {
        slug: `course-${category.slug}`,
        titleEn: `${category.titleEn} - Complete Course`,
        titleRu: `${category.titleRu} - Полный курс`,
        description: courseDescriptions[category.slug] || category.description,
        shortDescription: `Изучите ${category.titleRu.toLowerCase()} с ведущими экспертами`,
        thumbnailUrl: category.imageUrl,
        categoryId: category.id,
        duration: `${category.videos.length} уроков`,
        level: courseLevels[category.slug] || 'BEGINNER',
        isPremium: Math.random() > 0.5,
        price: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 1000 : null,
        xpReward: category.videos.length * 20,
        published: true,
        featured: Math.random() > 0.6,
      },
    });

    console.log(`📚 Created course: ${course.titleRu}`);

    // Create lessons from videos
    for (let i = 0; i < category.videos.length; i++) {
      const video = category.videos[i];
      await prisma.lesson.create({
        data: {
          slug: `lesson-${i + 1}`,
          titleEn: video.titleEn,
          titleRu: video.titleRu,
          description: video.description,
          courseId: course.id,
          videoId: video.id,
          order: i + 1,
          duration: video.duration,
          xpReward: 20,
          isFree: i === 0, // First lesson is always free
        },
      });
    }
    
    console.log(`   ✓ Added ${category.videos.length} lessons`);
  }

  console.log('✅ Database seeding completed successfully!');
  
  // Print summary
  const categoriesCount = await prisma.category.count();
  const videosCount = await prisma.video.count();
  const relatedCount = await prisma.relatedVideo.count();
  const coursesCount = await prisma.course.count();
  const lessonsCount = await prisma.lesson.count();
  
  console.log(`📊 Summary:`);
  console.log(`   Categories: ${categoriesCount}`);
  console.log(`   Videos: ${videosCount}`);
  console.log(`   Courses: ${coursesCount}`);
  console.log(`   Lessons: ${lessonsCount}`);
  console.log(`   Related connections: ${relatedCount}`);
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
