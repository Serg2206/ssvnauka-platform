
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Защита админских маршрутов
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Защита премиум контента (примеры)
    const premiumPaths = [
      '/courses',
      '/dashboard',
    ];

    const requiresPremium = premiumPaths.some((p) => path.startsWith(p));

    if (requiresPremium) {
      // Разрешить доступ к listing страницам
      if (path === '/courses' || path === '/dashboard') {
        return NextResponse.next();
      }

      // Для конкретных курсов - проверяем роль
      const role = token?.role as string;
      const hasPremiumAccess = ['PREMIUM', 'PRO', 'ADMIN'].includes(role);

      if (!hasPremiumAccess) {
        // Редирект на pricing page
        return NextResponse.redirect(
          new URL(`/pricing?message=premium_required&from=${encodeURIComponent(path)}`, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/admin/:path*',
  ],
};
