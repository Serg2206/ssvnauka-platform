'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, Search, Play, BookOpen, Users, Phone, User, Settings, LogOut, Crown, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Главная', href: '/', icon: Play },
  { name: 'Курсы', href: '/courses', icon: BookOpen },
  { name: 'Тарифы', href: '/pricing', icon: CreditCard },
  { name: 'Категории', href: '#categories', icon: BookOpen },
  { name: 'Контакты', href: '#contact', icon: Phone },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()

  const getRoleBadge = () => {
    if (!session?.user) return null
    
    const role = session.user.role
    
    if (role === 'PRO') {
      return <Badge className="bg-purple-600 text-white"><Crown className="w-3 h-3 mr-1" />PRO</Badge>
    }
    if (role === 'PREMIUM') {
      return <Badge className="bg-blue-600 text-white">Premium</Badge>
    }
    return <Badge variant="outline">Free</Badge>
  }

  const getUserInitials = () => {
    if (!session?.user?.name) return 'U'
    return session.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">SSVproff</span>
                <p className="text-xs text-muted-foreground">Хирургическое образование</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={() => {
                const searchSection = document.getElementById('categories')
                searchSection?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Search className="w-4 h-4 mr-2" />
              Поиск
            </Button>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse hidden md:block" />
            ) : session?.user ? (
              <div className="hidden md:flex items-center space-x-3">
                {getRoleBadge()}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Личный кабинет</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Настройки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Начать обучение</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                  
                  {session?.user ? (
                    <>
                      <div className="pt-2 border-t">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                          </div>
                          {getRoleBadge()}
                        </div>
                      </div>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          Личный кабинет
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600"
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </Button>
                    </>
                  ) : (
                    <div className="pt-4 border-t space-y-2">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/signin" onClick={() => setIsOpen(false)}>Войти</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>Начать обучение</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
