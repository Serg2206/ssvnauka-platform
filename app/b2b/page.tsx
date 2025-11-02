
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Building2, Users, BarChart3, Headphones, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function B2BPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    numberOfUsers: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: 'Запрос на корпоративную лицензию',
        }),
      });

      if (!response.ok) throw new Error('Ошибка отправки заявки');

      toast.success('Заявка отправлена! Мы свяжемся с вами в течение 24 часов.');
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        numberOfUsers: '',
        message: '',
      });
    } catch (error) {
      toast.error('Не удалось отправить заявку. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Команда',
      users: 'До 10 пользователей',
      price: '$499/месяц',
      features: [
        'Все премиум материалы',
        'Базовая аналитика',
        'Email поддержка',
        'Ежемесячные отчеты',
      ],
    },
    {
      name: 'Клиника',
      users: 'До 50 пользователей',
      price: '$1,999/месяц',
      popular: true,
      features: [
        'Все из Команда +',
        'Расширенная аналитика',
        'Кастомные курсы',
        'Выделенный менеджер',
        'Приоритетная поддержка',
      ],
    },
    {
      name: 'Госпиталь',
      users: 'До 100+ пользователей',
      price: '$3,499/месяц',
      features: [
        'Все из Клиника +',
        'Интеграция с LMS',
        'Персональное обучение',
        '24/7 поддержка',
        'Безлимитные курсы',
        'Индивидуальная программа',
      ],
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: 'Управление командой',
      description: 'Централизованное управление доступом и прогрессом всех сотрудников',
    },
    {
      icon: BarChart3,
      title: 'Детальная аналитика',
      description: 'Отслеживание прогресса обучения, статистика по курсам и сотрудникам',
    },
    {
      icon: Award,
      title: 'Корпоративные сертификаты',
      description: 'Брендированные сертификаты с логотипом вашей организации',
    },
    {
      icon: Zap,
      title: 'Кастомный контент',
      description: 'Создание специализированных курсов под потребности клиники',
    },
    {
      icon: Headphones,
      title: 'Персональный менеджер',
      description: 'Выделенный менеджер для решения любых вопросов',
    },
    {
      icon: Building2,
      title: 'Интеграция систем',
      description: 'Интеграция с вашей существующей LMS или HR системой',
    },
  ];

  const clients = [
    { name: 'Городская Клиника №1', users: 45, savings: '$12,000/год' },
    { name: 'Медицинский Университет', users: 120, savings: '$30,000/год' },
    { name: 'Частная Хирургическая Клиника', users: 25, savings: '$8,000/год' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-500 text-white">Корпоративные решения</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Обучение для всей команды хирургов
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Повысьте квалификацию всех специалистов вашей клиники с помощью профессиональной образовательной платформы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600" onClick={() => {
              document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Получить предложение
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                window.open('mailto:demo@ssvnauka.com?subject=Запрос на демо-версию', '_blank');
              }}
            >
              Демо-версия
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Преимущества корпоративных лицензий</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <Icon className="w-10 h-10 text-blue-500 mb-2" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Тарифные планы</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Выберите подходящий план или запросите индивидуальное предложение
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card key={idx} className={plan.popular ? 'border-blue-500 shadow-xl relative' : ''}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Популярный</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.users}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'} onClick={() => {
                    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Связаться с нами
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Наши клиенты экономят</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {clients.map((client, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>{client.users} пользователей</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {client.savings}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    экономия в сравнении с индивидуальными подписками
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Запросить предложение</CardTitle>
              <CardDescription>
                Заполните форму, и мы свяжемся с вами в течение 24 часов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Название организации *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Контактное лицо *</Label>
                    <Input
                      id="contactName"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="numberOfUsers">Количество пользователей *</Label>
                  <Input
                    id="numberOfUsers"
                    type="number"
                    required
                    placeholder="Например: 25"
                    value={formData.numberOfUsers}
                    onChange={(e) => setFormData({ ...formData, numberOfUsers: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Дополнительная информация</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Расскажите о ваших потребностях и целях обучения..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
