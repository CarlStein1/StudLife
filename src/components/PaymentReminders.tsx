import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Screen } from '../App';

import {
  BellIcon,
  PlusIcon,
  Trash2Icon,
  CheckIcon,
  AlertCircleIcon,
} from './Icons';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { usePayments } from '../storage/features/payments/usePayments';
import type { PaymentReminder } from '../storage/features/payments/types';
import { PremiumLimitModal } from './ui/premiumlimitmodal';

const MAX_FREE_REMINDERS = 10;

// ---- helpers для дат ----
const parseDate = (value: string): Date | null => {
  if (!value) return null;

  // формат dd.MM.yyyy
  if (value.includes('.')) {
    const [dayStr, monthStr, yearStr] = value.split('.');
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!day || !month || !year) return null;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // формат yyyy-MM-dd (из input type="date" или старых данных)
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (value: string): string => {
  const d = parseDate(value);
  if (!d) return value; // если что-то странное — покажем как есть

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

type PaymentRemindersProps = {
  setCurrentScreen?: Dispatch<SetStateAction<Screen>>;
};

export function PaymentReminders({ setCurrentScreen }: PaymentRemindersProps) {
  const { payments, isLoading, addReminder, updateReminder, removeReminder } =
    usePayments();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentTitle, setNewPaymentTitle] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [newPaymentRecurring, setNewPaymentRecurring] = useState(false);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  if (isLoading || !payments) {
    return (
      <div className="p-4 w-full">
        <Card className="p-4">Загрузка напоминаний…</Card>
      </div>
    );
  }

  const reminders = payments.reminders;

  const getDaysUntil = (dueDate: string) => {
    const due = parseDate(dueDate);
    if (!due) return 0;

    const today = new Date();
    // обнуляем время, чтобы считать чистые дни
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryColor = (category: 'general' | 'urgent' | 'paid') => {
    switch (category) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'paid':
        return 'border-green-200 bg-green-50 opacity-60';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const upcomingPayments = reminders.filter((r) => !r.isPaid);
  const totalUpcoming = upcomingPayments.reduce((acc, r) => acc + r.amount, 0);

  const markAsPaid = (id: string) => {
    updateReminder(id, { isPaid: true });
  };

  const deletePayment = (id: string) => {
    removeReminder(id);
  };

  const handleAddPayment = () => {
    if (upcomingPayments.length >= MAX_FREE_REMINDERS) {
      setShowAddForm(false);
      setIsPremiumModalOpen(true);
      return;
    }

    if (!newPaymentTitle.trim() || !newPaymentAmount || !newPaymentDate) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // сохраняем дату в виде dd.MM.yyyy
    const formattedDueDate = formatDate(newPaymentDate);

    const newReminder: PaymentReminder = {
      id: Date.now().toString(),
      title: newPaymentTitle.trim(),
      amount: parseFloat(newPaymentAmount),
      dueDate: formattedDueDate,
      isRepeating: newPaymentRecurring,
      repeatRule: newPaymentRecurring ? 'monthly' : 'none',
      isPaid: false,
    };

    addReminder(newReminder);

    setNewPaymentTitle('');
    setNewPaymentAmount('');
    setNewPaymentDate('');
    setNewPaymentRecurring(false);
    setShowAddForm(false);
  };

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Статистика */}
      <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl">Напоминания</h2>
          <BellIcon className="w-8 h-8 flex-shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">Предстоящие</p>
            <p className="text-3xl">
              {upcomingPayments.length} / {MAX_FREE_REMINDERS}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Сумма</p>
            <p className="text-3xl">₽{totalUpcoming.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Кнопка добавления */}
      <Button
        onClick={() => {
          if (upcomingPayments.length >= MAX_FREE_REMINDERS) {
            setIsPremiumModalOpen(true);
            setShowAddForm(false);
          } else {
            setShowAddForm(!showAddForm);
          }
        }}
        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95"
      >
        <PlusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
        Добавить напоминание
      </Button>

      {/* Форма добавления */}
      {showAddForm && (
        <Card className="p-4 border-2 border-orange-200">
          <h3 className="text-sm mb-3">Новое напоминание</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название платежа"
              value={newPaymentTitle}
              onChange={(e) => setNewPaymentTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="number"
              placeholder="Сумма"
              value={newPaymentAmount}
              onChange={(e) => setNewPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="date"
              value={newPaymentDate}
              onChange={(e) => setNewPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={newPaymentRecurring}
                onChange={(e) => setNewPaymentRecurring(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="recurring" className="text-sm">
                Повторяющийся платеж
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleAddPayment}
              >
                Сохранить
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPaymentTitle('');
                  setNewPaymentAmount('');
                  setNewPaymentDate('');
                  setNewPaymentRecurring(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Список платежей */}
      <div>
        <h3 className="text-sm mb-3">🎯 Предстоящие платежи</h3>
        <div className="space-y-3">
          {reminders.map((payment) => {
            const daysUntil = getDaysUntil(payment.dueDate);
            const isPaid = payment.isPaid;
            const isOverdue = !isPaid && daysUntil < 0;
            const isUrgent = !isPaid && daysUntil >= 0 && daysUntil <= 3;

            let category: 'general' | 'urgent' | 'paid' = 'general';
            if (isPaid) category = 'paid';
            else if (isOverdue || isUrgent) category = 'urgent';

            return (
              <Card
                key={payment.id}
                className={`p-4 ${getCategoryColor(category)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm">{payment.title}</h4>
                      {payment.isRepeating && (
                        <Badge variant="outline" className="text-xs">
                          Повтор
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold mb-1">
                      ₽{payment.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {isPaid ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckIcon className="w-3 h-3" />
                          Оплачено
                        </span>
                      ) : (
                        <>
                          {isOverdue ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircleIcon className="w-3 h-3" />
                              Просрочено на {Math.abs(daysUntil)} дн.
                            </span>
                          ) : isUrgent ? (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircleIcon className="w-3 h-3" />
                              Осталось {daysUntil} дн.
                            </span>
                          ) : (
                            <span>До {formatDate(payment.dueDate)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!isPaid && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(payment.id)}
                        className="bg-green-600 hover:bg-green-700 h-8 px-3"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePayment(payment.id)}
                      className="h-8 px-3"
                    >
                      <Trash2Icon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Советы */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-sm mb-2">📌 Советы по оплате</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Оплачивайте счета заранее</li>
          <li>• Настройте автоплатежи для регулярных счетов</li>
          <li>• Следите за скидками при ранней оплате</li>
          <li>• Объединяйте платежи для экономии комиссии</li>
        </ul>
      </Card>

      {/* Модальное окно лимита Premium */}
      <PremiumLimitModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onOpenPremium={() => {
          if (setCurrentScreen) {
            setCurrentScreen('premium');
          }
        }}
        limit={MAX_FREE_REMINDERS}
        entityLabel="напоминаний"
      />
    </div>
  );
}
