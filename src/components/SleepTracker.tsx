import { MoonIcon, SunIcon, TrendingUpIcon, CalendarIcon } from './Icons';
import { Button } from './ui/button';
import { Card } from './ui/card';

import { useSleepState } from '../storage/features/sleep/useSleepState';

type Quality = 'excellent' | 'good' | 'fair' | 'poor';

function getQualityFromHours(hours: number): Quality {
  if (hours < 6) return 'poor';
  if (hours < 7) return 'fair';
  if (hours < 8) return 'good';
  return 'excellent';
}

function getQualityColor(quality: Quality) {
  switch (quality) {
    case 'excellent':
      return 'bg-green-500';
    case 'good':
      return 'bg-blue-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function getQualityLabel(quality: Quality) {
  switch (quality) {
    case 'excellent':
      return 'Отлично';
    case 'good':
      return 'Хорошо';
    case 'fair':
      return 'Средне';
    case 'poor':
      return 'Плохо';
    default:
      return '';
  }
}

// длительность сна в часах по двум строкам 'HH:MM'
function calcSleepHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;

  // если время окончания "раньше" — сон через полночь
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  const diffMin = endMin - startMin;
  const hours = diffMin / 60;

  return Math.round(hours * 10) / 10;
}

// месяцы в родительном падеже
const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/** универсальный парсер для сортировки: '2025-12-01' и '01.12.2025' */
function parseSleepDate(value: string): Date {
  if (!value) return new Date(0);

  // dd.mm.yyyy
  if (value.includes('.')) {
    const [d, m, y] = value.split('.');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // yyyy-MM-dd
  if (value.includes('-')) {
    const [y, m, d] = value.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  return new Date(value);
}

/**
 * Преобразуем дату к формату "29 ноября".
 * (в сторе сейчас храним как "дд.мм.гггг", но на всякий случай
 * поддерживаем оба варианта)
 */
function formatSleepDateToWords(value: string): string {
  if (!value) return '';

  let dayStr = '';
  let monthIndex = 0;

  // формат dd.mm.yyyy
  if (value.includes('.')) {
    const [d, m] = value.split('.');
    dayStr = d;
    monthIndex = Number(m) - 1;
  }
  // формат yyyy-MM-dd
  else if (value.includes('-')) {
    const [, month, day] = value.split('-');
    dayStr = day;
    monthIndex = Number(month) - 1;
  } else {
    return value;
  }

  const day = Number(dayStr);
  const monthName = MONTHS_RU[monthIndex] ?? '';

  if (!monthName || !day) return value;

  return `${day} ${monthName}`;
}

/**
 * Текущую дату сохраняем в формате дд.мм.гггг
 * (совпадает с нормализацией внутри useSleepState).
 */
function getTodayFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  return `${day}.${month}.${year}`;
}

export function SleepTracker() {
  const { sleep, isLoading, updateSettings, addEntry } = useSleepState();

  if (isLoading || !sleep) {
    return (
      <div className="p-4 w-full">
        <Card className="p-4">Загрузка данных сна…</Card>
      </div>
    );
  }

  const { settings, history } = sleep;

  const averageSleep =
    history.length > 0
      ? history.reduce((acc, record) => acc + record.hours, 0) / history.length
      : 0;

  const handleBedTimeChange = (value: string) => {
    updateSettings({ bedTime: value });
  };

  const handleWakeTimeChange = (value: string) => {
    updateSettings({ wakeTime: value });
  };

  const handleSaveSchedule = () => {
    const { bedTime, wakeTime } = sleep.settings;

    // передаём "дд.мм.гггг", хук дополнительно нормализует и отсортирует
    const today = getTodayFormatted();
    const hours = calcSleepHours(bedTime, wakeTime);

    addEntry({
      date: today,
      sleepStart: bedTime,
      sleepEnd: wakeTime,
      hours,
    });

    console.log('Запись сна сохранена', { date: today, bedTime, wakeTime, hours });
  };

  // сортируем историю по дате по убыванию (последняя запись сверху)
  const sortedHistory = [...history].sort(
    (a, b) => parseSleepDate(b.date).getTime() - parseSleepDate(a.date).getTime()
  );

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Статистика */}
      <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl">Трекер сна</h2>
          <MoonIcon className="w-8 h-8 flex-shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">Средний сон</p>
            <p className="text-3xl">{averageSleep.toFixed(1)}ч</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Цель</p>
            <p className="text-3xl">{settings.targetHours}ч</p>
          </div>
        </div>
      </Card>

      {/* Время сна */}
      <Card className="p-4">
        <h3 className="text-sm mb-3 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 flex-shrink-0" />
          Расписание сна
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <MoonIcon className="w-4 h-4 flex-shrink-0" />
              Время сна
            </label>
            <input
              type="time"
              value={settings.bedTime}
              onChange={(e) => handleBedTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <SunIcon className="w-4 h-4 flex-shrink-0" />
              Время пробуждения
            </label>
            <input
              type="time"
              value={settings.wakeTime}
              onChange={(e) => handleWakeTimeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base"
            />
          </div>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95"
            onClick={handleSaveSchedule}
          >
            Сохранить расписание
          </Button>
        </div>
      </Card>

      {/* История сна */}
      <Card className="p-4">
        <h3 className="text-sm mb-3 flex items-center gap-2">
          <TrendingUpIcon className="w-4 h-4" />
          История сна (последние 7 дней)
        </h3>
        <div className="space-y-2">
          {sortedHistory.map((record) => {
            const quality = getQualityFromHours(record.hours);
            const dateLabel = formatSleepDateToWords(record.date);

            return (
              <div key={record.date} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">
                  {dateLabel}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`h-full ${getQualityColor(quality)} transition-all`}
                    style={{
                      width: `${(record.hours / settings.targetHours) * 100}%`,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm">
                    {record.hours}ч
                  </span>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {getQualityLabel(quality)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Рекомендации */}
      <Card className="p-4 bg-purple-50 border-purple-100">
        <h3 className="text-sm mb-2">💤 Рекомендации</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Старайтесь спать 7-9 часов</li>
          <li>• Ложитесь спать в одно время</li>
          <li>• Избегайте гаджетов за час до сна</li>
          <li>• Проветривайте комнату перед сном</li>
        </ul>
      </Card>
    </div>
  );
}
