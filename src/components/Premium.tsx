import { useState } from 'react';
import {
  CrownIcon,
  CheckIcon,
  ZapIcon,
  ShieldIcon,
  StarIcon,
  SparklesIcon,
} from './Icons';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function Premium() {
  const [showPaymentHint, setShowPaymentHint] = useState(false);

  const openPaymentHint = () => setShowPaymentHint(true);
  const closePaymentHint = () => setShowPaymentHint(false);

  const features = [
    { text: 'Неограниченные напоминания', icon: CheckIcon },
    { text: 'Расширенная статистика сна', icon: CheckIcon },
    { text: 'Персональные рекомендации по экономии', icon: CheckIcon },
    { text: 'Приоритетный доступ к вакансиям', icon: CheckIcon },
    { text: 'Без рекламы', icon: CheckIcon },
    { text: 'Темная тема', icon: CheckIcon },
  ];

  const plans = [
    {
      name: 'Месяц',
      price: '299',
      period: 'мес',
      savings: null,
      popular: false,
    },
    {
      name: '6 месяцев',
      price: '1,499',
      period: '6 мес',
      savings: 'Экономия 15%',
      popular: true,
    },
    {
      name: 'Год',
      price: '2,499',
      period: 'год',
      savings: 'Экономия 30%',
      popular: false,
    },
  ];

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Заголовок Premium */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4">
          <CrownIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl mb-2">StudLife Premium</h2>
        <p className="text-gray-600">Получите максимум от приложения</p>
      </div>

      {/* Преимущества */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
        <h3 className="text-sm mb-3 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-amber-600" />
          Что входит в Premium
        </h3>
        <div className="space-y-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Тарифные планы */}
      <div>
        <h3 className="text-sm mb-3 text-center">Выберите план</h3>
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-4 relative ${plan.popular
                ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
                : ''
                }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Популярный
                </Badge>
              )}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{plan.name}</h4>
                  {plan.savings && (
                    <p className="text-xs text-green-600 mt-1">
                      {plan.savings}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl">₽{plan.price}</p>
                  <p className="text-xs text-gray-500">/ {plan.period}</p>
                </div>
              </div>
              <Button
                className={`w-full ${plan.popular
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                  : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                onClick={openPaymentHint}
              >
                Выбрать план
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Дополнительные преимущества */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ZapIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs">Мгновенная активация</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs">Безопасная оплата</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <StarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs">Отмена в любое время</p>
        </Card>
      </div>

      {/* Сравнение */}
      <Card className="p-4">
        <h3 className="text-sm mb-3">Сравнение планов</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm pb-3 border-b">
            <div className="text-gray-600">Бесплатный</div>
            <div className="font-semibold text-amber-600">Premium</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">10 накоплений и напоминаний</div>
            <div className="text-green-600">∞ Безлимит</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Базовая статистика</div>
            <div className="text-green-600">Полная аналитика</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">С рекламой</div>
            <div className="text-green-600">Без рекламы</div>
          </div>
        </div>
      </Card>

      {/* Отзывы */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <h3 className="text-sm mb-3">⭐ Отзывы студентов</h3>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className="w-3 h-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700">
              "Подписка премиум помогла мне организовать жизнь во время сессии!"
            </p>
            <p className="text-xs text-gray-500 mt-1">- Александра, КЭУП</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className="w-3 h-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700">
              "Нашел работу благодаря студлайф)"
            </p>
            <p className="text-xs text-gray-500 mt-1">- Дмитрий, ДГТУ</p>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-sm mb-2">❓ Часто задаваемые вопросы</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <details className="cursor-pointer">
            <summary className="font-medium">Как отменить подписку?</summary>
            <p className="mt-1 text-xs">
              Вы можете отменить подписку в любое время в настройках аккаунта.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium">Есть ли студенческая скидка?</summary>
            <p className="mt-1 text-xs">
              Да! Все указанные цены уже со студенческой скидкой 50%.
            </p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium">Можно ли попробовать бесплатно?</summary>
            <p className="mt-1 text-xs">
              Да, первые 7 дней Premium бесплатно для новых пользователей.
            </p>
          </details>
        </div>
      </Card>

      {/* CTA */}
      <Button
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 h-12 text-base active:scale-95"
        onClick={openPaymentHint}
      >
        <CrownIcon className="w-5 h-5 mr-2 flex-shrink-0" />
        Попробовать Premium бесплатно
      </Button>
      <p className="text-center text-xs text-gray-500 px-4">
        7 дней бесплатно, затем ₽299/мес. Отмена в любое время.
      </p>

      {/* Модальное окно о переходе на оплату */}
      {showPaymentHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-[calc(100%-2rem)] p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CrownIcon className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-semibold">
                  Оформление Premium-подписки
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                onClick={closePaymentHint}
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-700">
              Чтобы оплатить подписку, нажмите на кнопку
              <span className="font-semibold"> «Оплата»</span> и выберите удобный способ оплаты.
            </p>

            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 bg-gray-900 hover:bg-gray-800"
                onClick={closePaymentHint}
              >
                Оплата
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={closePaymentHint}
              >
                Закрыть
              </Button>
            </div>

            <p className="text-[10px] text-gray-500 mt-2 text-center">
              Позже вы сможете вернуться к выбору тарифа на этой странице.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
