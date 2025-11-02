import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'SSVproff - Платформа хирургического образования',
  description: 'Профессиональная платформа для обучения хирургов. Лапароскопическая хирургия, роботическая хирургия, эндоскопические процедуры и минимально инвазивные техники.',
  keywords: 'SSVproff, хирургия, лапароскопия, роботическая хирургия, медицинское образование, хирургические техники, ssvnauka',
  openGraph: {
    title: 'SSVproff - Платформа хирургического образования',
    description: 'Профессиональная платформа для обучения хирургов',
    url: 'https://ssvnauka.com',
    siteName: 'SSVproff',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}