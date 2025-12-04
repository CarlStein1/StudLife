import { useState } from 'react';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  BookmarkPlusIcon,
  ExternalLinkIcon,
  FilterIcon,
} from './Icons';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

import { useJobs } from '../storage/features/jobs/useJobs';
import type { Job as StoredJob, EmploymentType } from '../storage/features/jobs/types';

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// универсальный парсер дат для вакансий: yyyy-MM-dd ИЛИ dd.MM.yyyy
function parseJobDate(value: string): Date | null {
  if (!value) return null;

  // dd.MM.yyyy
  if (value.includes('.')) {
    const [dayStr, monthStr, yearStr] = value.split('.');
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!day || !month || !year) return null;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // yyyy-MM-dd
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// "Сегодня", "1 день назад", "2 дня назад", "5 дней назад"
function getPostedLabel(postedAt: string): string {
  const postedDate = parseJobDate(postedAt);
  if (!postedDate) return 'Дата не указана';

  const now = new Date();

  const postedUtc = Date.UTC(
    postedDate.getFullYear(),
    postedDate.getMonth(),
    postedDate.getDate()
  );
  const nowUtc = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const diffDays = Math.round((nowUtc - postedUtc) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Сегодня';
  if (diffDays === 1) return '1 день назад';
  if (diffDays >= 2 && diffDays <= 4) return `${diffDays} дня назад`;
  return `${diffDays} дней назад`;
}

function getTypeLabel(type: EmploymentType) {
  switch (type) {
    case 'full-time':
      return 'Полная занятость';
    case 'part-time':
      return 'Частичная';
    case 'intern':
      return 'Стажировка';
    case 'remote':
      return 'Удаленно';
    default:
      return type;
  }
}

function getTypeColor(type: EmploymentType) {
  switch (type) {
    case 'full-time':
      return 'bg-blue-100 text-blue-700';
    case 'part-time':
      return 'bg-green-100 text-green-700';
    case 'intern':
      return 'bg-purple-100 text-purple-700';
    case 'remote':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// форматируем зарплату из min/max
function formatSalary(job: StoredJob): string {
  const { salaryMin, salaryMax } = job;
  if (salaryMin && salaryMax && salaryMin !== salaryMax) {
    return `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()} ₽`;
  }
  if (salaryMin) return `${salaryMin.toLocaleString()} ₽`;
  if (salaryMax) return `${salaryMax.toLocaleString()} ₽`;
  return 'По договоренности';
}

type SortOrder = 'newest' | 'oldest' | 'high' | 'low';

// ===== КОМПОНЕНТ =====

export function JobGuide() {
  const { jobsState, isLoading, toggleFavorite } = useJobs();

  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const [search, setSearch] = useState('');
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // --- ПРИМЕНЁННЫЕ значения фильтров (по ним реально фильтруем) ---
  const [selectedTypes, setSelectedTypes] = useState<EmploymentType[]>([
    'full-time',
    'part-time',
    'intern',
    'remote',
  ]);
  const [cityFilter, setCityFilter] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // --- ЧЕРНОВИКИ для модального окна ---
  const [draftTypes, setDraftTypes] = useState<EmploymentType[]>([
    'full-time',
    'part-time',
    'intern',
    'remote',
  ]);
  const [draftCity, setDraftCity] = useState('');
  const [draftMinSalary, setDraftMinSalary] = useState('');
  const [draftMaxSalary, setDraftMaxSalary] = useState('');
  const [draftSortOrder, setDraftSortOrder] = useState<SortOrder>('newest');

  if (isLoading || !jobsState) {
    return (
      <div className="p-4 w-full">
        <Card className="p-4">Загрузка вакансий…</Card>
      </div>
    );
  }

  const jobs = jobsState.jobs;

  const toggleSave = (id: string) => {
    toggleFavorite(id);
  };

  // переключение типа занятости в ЧЕРНОВИКЕ
  const toggleDraftType = (type: EmploymentType) => {
    setDraftTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // открыть модалку: подтягиваем в черновики текущие применённые значения
  const openFilters = () => {
    setDraftTypes(selectedTypes);
    setDraftCity(cityFilter);
    setDraftMinSalary(minSalary);
    setDraftMaxSalary(maxSalary);
    setDraftSortOrder(sortOrder);
    setShowFilterDialog(true);
  };

  // применяем черновики
  const applyFilters = () => {
    setSelectedTypes(draftTypes);
    setCityFilter(draftCity);
    setMinSalary(draftMinSalary);
    setMaxSalary(draftMaxSalary);
    setSortOrder(draftSortOrder);
    setShowFilterDialog(false);
  };

  // фильтрация по ПРИМЕНЁННЫМ значениям
  const filteredJobs = jobs.filter((job) => {
    if (filter === 'saved' && !job.isFavorite) return false;
    if (!selectedTypes.includes(job.employmentType)) return false;

    const q = search.trim().toLowerCase();
    if (q) {
      const inText =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.city.toLowerCase().includes(q);
      if (!inText) return false;
    }

    const cityQ = cityFilter.trim().toLowerCase();
    if (cityQ && !job.city.toLowerCase().includes(cityQ)) {
      return false;
    }

    const min = Number(minSalary);
    const max = Number(maxSalary);
    const jobMax = job.salaryMax ?? job.salaryMin ?? 0;
    const jobMin = job.salaryMin ?? job.salaryMax ?? 0;

    if (!Number.isNaN(min) && min > 0 && jobMax < min) return false;
    if (!Number.isNaN(max) && max > 0 && jobMin > max) return false;

    return true;
  });

  // сортировка
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === 'newest' || sortOrder === 'oldest') {
      const da = parseJobDate(a.postedAt)?.getTime() ?? 0;
      const db = parseJobDate(b.postedAt)?.getTime() ?? 0;
      return sortOrder === 'newest' ? db - da : da - db;
    }

    const sa = a.salaryMin ?? a.salaryMax ?? 0;
    const sb = b.salaryMin ?? b.salaryMax ?? 0;
    return sortOrder === 'high' ? sb - sa : sa - sb;
  });

  return (

    <div className="p-4 space-y-4 w-full">
      {/* Статистика */}
      <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl">Поиск работы</h2>
          <BriefcaseIcon className="w-8 h-8 flex-shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">Вакансий</p>
            <p className="text-3xl">{jobs.length}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Сохранено</p>
            <p className="text-3xl">{jobs.filter((j) => j.isFavorite).length}</p>
          </div>
        </div>
      </Card>

      {/* Поиск и фильтры */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Поиск вакансий..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base outline-none focus:border-blue-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600' : ''}
          >
            Все
          </Button>
          <Button
            size="sm"
            variant={filter === 'saved' ? 'default' : 'outline'}
            onClick={() => setFilter('saved')}
            className={filter === 'saved' ? 'bg-blue-600' : ''}
          >
            Избранное
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={openFilters}
          >
            <FilterIcon className="w-4 h-4 mr-1" />
            Фильтры
          </Button>
        </div>
      </div>

      {/* Список вакансий */}
      <div className="space-y-3">
        {sortedJobs.map((job: StoredJob) => (
          <Card key={job.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{job.company}</p>
              </div>
              <button
                onClick={() => toggleSave(job.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookmarkPlusIcon
                  className={`w-5 h-5 ${job.isFavorite
                    ? 'fill-blue-600 text-blue-600'
                    : 'text-gray-400'
                    }`}
                />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                {job.city}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSignIcon className="w-4 h-4" />
                {formatSalary(job)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                {getPostedLabel(job.postedAt)}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{job.description}</p>

            <div className="flex items-center justify-between">
              <Badge className={getTypeColor(job.employmentType)}>
                {getTypeLabel(job.employmentType)}
              </Badge>

              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-0 py-2 bg-black text-white rounded-lg"
                >
                  Подробнее
                </a>
                <ExternalLinkIcon className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Полезные ресурсы */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-sm mb-3">🎯 Полезные ресурсы</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Составить резюме
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Подготовка к собеседованию
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Права студента-работника
          </Button>
        </div>
      </Card>

      {/* Советы */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h3 className="text-sm mb-2">💼 Советы по поиску работы</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Обновляйте резюме регулярно</li>
          <li>• Используйте студенческие биржи</li>
          <li>• Рассмотрите стажировки</li>
          <li>• Развивайте навыки параллельно учебе</li>
        </ul>
      </Card>

      {/* Модальное окно фильтров */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent
          className="
            w-[95vw] max-w-md 
            p-4 sm:p-6 
            rounded-2xl 
            max-h-[80vh] 
            flex flex-col
          "
        >
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg text-center">
              Фильтры
            </DialogTitle>
          </DialogHeader>

          {/* Прокручиваемая часть, чтобы на маленьком экране ничего не обрезалось */}
          <div className="flex-1 overflow-y-auto space-y-4 pt-1">

            {/* Тип занятости */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Тип занятости</h4>
              <div className="space-y-2">
                {[
                  { key: 'full-time', label: 'Полная занятость' },
                  { key: 'part-time', label: 'Частичная занятость' },
                  { key: 'intern', label: 'Стажировка' },
                  { key: 'remote', label: 'Удаленная работа' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={draftTypes.includes(item.key as EmploymentType)}
                      onChange={() =>
                        toggleDraftType(item.key as EmploymentType)
                      }
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Город */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Город</h4>
              <input
                type="text"
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                placeholder="Например, Москва"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            {/* Зарплата */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Диапазон зарплаты (₽)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={draftMinSalary}
                  onChange={(e) => setDraftMinSalary(e.target.value)}
                  placeholder="От"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={draftMaxSalary}
                  onChange={(e) => setDraftMaxSalary(e.target.value)}
                  placeholder="До"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Сортировка */}
            <div className="space-y-1 pb-2">
              <h4 className="text-sm font-medium">Сортировка</h4>
              <select
                value={draftSortOrder}
                onChange={(e) =>
                  setDraftSortOrder(e.target.value as SortOrder)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="high">Высокооплачиваемые</option>
                <option value="low">Низкооплачиваемые</option>
              </select>
            </div>
          </div>

          {/* Кнопки снизу, всегда видны */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={applyFilters}
            >
              Применить
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const allTypes: EmploymentType[] = [
                  'full-time',
                  'part-time',
                  'intern',
                  'remote',
                ];
                setSelectedTypes(allTypes);
                setCityFilter('');
                setMinSalary('');
                setMaxSalary('');
                setSortOrder('newest');

                setDraftTypes(allTypes);
                setDraftCity('');
                setDraftMinSalary('');
                setDraftMaxSalary('');
                setDraftSortOrder('newest');

                setShowFilterDialog(false);
              }}
            >
              Сбросить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
