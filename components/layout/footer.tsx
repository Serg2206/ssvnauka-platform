
import Link from 'next/link'
import { Play } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">SSVproff</span>
                <p className="text-xs text-muted-foreground">ssvnauka.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Профессиональная платформа хирургического образования для медицинских специалистов
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Категории</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Лапароскопическая хирургия</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Роботическая хирургия</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Эндоскопические процедуры</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Обучение</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Симуляционные центры</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Медицинские инструменты</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Хирургическая анатомия</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>ssvnauka.com</li>
              <li>Россия</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 SSVproff. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
