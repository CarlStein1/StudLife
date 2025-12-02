import { useEffect, useState } from 'react';
import {
  MoonIcon,
  PiggyBankIcon,
  BellIcon,
  BriefcaseIcon,
  CrownIcon,
} from './Icons';
import type { Screen } from '../App';

import { useSleepState } from '../storage/features/sleep/useSleepState';
import { useSavings } from '../storage/features/savings/useSavings';
import { usePayments } from '../storage/features/payments/usePayments';
import { useJobs } from '../storage/features/jobs/useJobs';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

// универсальный парсер даты сна: '2025-12-01' или '01.12.2025'
function parseSleepDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  // dd.MM.yyyy
  if (dateStr.includes('.')) {
    const [d, m, y] = dateStr.split('.');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // yyyy-MM-dd
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // fallback
  return new Date(dateStr);
}

export function Home({ onNavigate }: HomeProps) {
  const { sleep } = useSleepState();
  const { savings } = useSavings();
  const { payments } = usePayments();
  const { jobsState } = useJobs();

  const [savingsStat, setSavingsStat] = useState('—');
  const [paymentsStat, setPaymentsStat] = useState('—');
  const [jobsStat, setJobsStat] = useState('—');

  // ===== Статистика сна за неделю (одно место истины) =====
  let weeklyAvg: number | null = null;
  let weeklyPercent: number | null = null;

  if (sleep && sleep.history && sleep.history.length > 0) {
    const last7 = [...sleep.history]
      .sort(
        (a, b) =>
          parseSleepDate(a.date).getTime() -
          parseSleepDate(b.date).getTime()
      )
      .slice(-7);

    const sum = last7.reduce((acc, r) => acc + (r.hours || 0), 0);
    const avg = sum / last7.length;

    weeklyAvg = avg;

    const target = sleep.settings.targetHours || 8;
    weeklyPercent = Math.min(100, Math.round((avg / target) * 100));
  }

  // значение для кнопки "Трекер сна" — то же самое среднее
  const sleepStat = weeklyAvg !== null ? `${weeklyAvg.toFixed(1)}ч` : '—';

  // ===== Общие накопления пользователя (для блока "Статистика недели") =====
  let totalSaved = 0;
  let savingsPercentTotal = 0;

  if (savings && savings.goals?.length) {
    totalSaved = savings.goals.reduce(
      (acc, g) => acc + (g.saved || 0),
      0
    );
    const totalTarget = savings.goals.reduce(
      (acc, g) => acc + (g.target || 0),
      0
    );
    savingsPercentTotal =
      totalTarget > 0
        ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
        : 0;
  }

  // Накопления: для плитки "Накопления" оставляем лучший прогресс по цели
  useEffect(() => {
    if (!savings || !savings.goals?.length) return;

    const bestGoal = savings.goals.reduce((best, g) => {
      const bestProgress = best.target > 0 ? best.saved / best.target : 0;
      const currentProgress = g.target > 0 ? g.saved / g.target : 0;
      return currentProgress > bestProgress ? g : best;
    }, savings.goals[0]);

    const percent =
      bestGoal.target > 0
        ? Math.round((bestGoal.saved / bestGoal.target) * 100)
        : 0;

    setSavingsStat(`${percent}%`);
  }, [savings]);

  // Напоминания: количество активных напоминаний
  useEffect(() => {
    if (!payments) return;
    const active = payments.reminders.filter((r) => !r.isPaid).length;
    setPaymentsStat(`${active} активн.`);
  }, [payments]);

  // Работа: количество вакансий
  useEffect(() => {
    if (!jobsState) return;
    setJobsStat(`${jobsState.jobs.length} вакансий`);
  }, [jobsState]);

  const quickActions = [
    {
      id: 'sleep' as Screen,
      icon: MoonIcon,
      label: 'Трекер сна',
      color: 'from-indigo-500 to-purple-500',
      stats: sleepStat,
    },
    {
      id: 'savings' as Screen,
      icon: PiggyBankIcon,
      label: 'Накопления',
      color: 'from-green-500 to-emerald-500',
      stats: savingsStat,
    },
    {
      id: 'payments' as Screen,
      icon: BellIcon,
      label: 'Оплата',
      color: 'from-orange-500 to-red-500',
      stats: paymentsStat,
    },
    {
      id: 'jobs' as Screen,
      icon: BriefcaseIcon,
      label: 'Работа',
      color: 'from-blue-500 to-cyan-500',
      stats: jobsStat,
    },
    {
      id: 'premium' as Screen,
      icon: CrownIcon,
      label: 'Premium',
      color: 'from-yellow-500 to-amber-500',
      stats: 'Подписка',
    },
  ];

  return (
    <div className="p-4 space-y-6 w-full">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-3xl mb-2">Привет, студент! 👋</h2>
        <p className="opacity-90">Добро пожаловать в StudLife</p>
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <p className="text-sm">
            Сегодня:{' '}
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      {/* Быстрый доступ */}
      <div>
        <h3 className="text-lg mb-3">Быстрый доступ</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 mx-auto`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-sm mb-1 break-words">
                  {action.label}
                </h4>
                <p className="text-xs text-gray-500 break-words">
                  {action.stats}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Совет дня */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-sm mb-2 text-blue-900">💡 Совет дня</h3>
        <p className="text-sm text-blue-800">
          Старайтесь ложиться спать в одно и то же время каждый день. Это
          поможет улучшить качество сна и повысить продуктивность!
        </p>
      </div>

      {/* Статистика недели */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h3 className="text-sm mb-3">Статистика недели</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Средний сон (7 дней)
            </span>
            {weeklyAvg !== null ? (
              <span className="font-semibold">
                {weeklyAvg.toFixed(1)}ч
              </span>
            ) : (
              <span className="font-semibold text-gray-400">—</span>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${weeklyPercent ?? 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Накопления</span>
            <span className="font-semibold text-green-600">
              {totalSaved > 0
                ? `₽${totalSaved.toLocaleString()}`
                : '—'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${savingsPercentTotal}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
