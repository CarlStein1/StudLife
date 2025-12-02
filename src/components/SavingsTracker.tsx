import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Screen } from "../App";

import {
  PiggyBankIcon,
  TrendingDownIcon,
  CoffeeIcon,
  PlusIcon,
  ShoppingBagIcon,
  BusIcon,
  UtensilsIcon,
  Trash2Icon,
} from "./Icons";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { PremiumLimitModal } from "./ui/premiumlimitmodal"; // ⬅️ общее модальное окно

import { useSavings } from "../storage/features/savings/useSavings";
import type { SavingsGoal } from "../storage/features/savings/types";

interface Expense {
  id: number;
  category: string;
  amount: number;
  icon: any;
  color: string;
  savingTip: string;
}

type SavingsTrackerProps = {
  setCurrentScreen?: Dispatch<SetStateAction<Screen>>;
};

const FREE_GOALS_LIMIT = 10;

export function SavingsTracker({ setCurrentScreen }: SavingsTrackerProps) {
  // локальные расходы
  const [expenses] = useState<Expense[]>([
    {
      id: 1,
      category: "Кофе и снеки",
      amount: 1250,
      icon: CoffeeIcon,
      color: "from-amber-500 to-orange-500",
      savingTip: "Берите кофе из дома - экономия до ₽800/мес",
    },
    {
      id: 2,
      category: "Одежда",
      amount: 2500,
      icon: ShoppingBagIcon,
      color: "from-pink-500 to-rose-500",
      savingTip: "Покупайте во время распродаж - скидки до 50%",
    },
    {
      id: 3,
      category: "Транспорт",
      amount: 1800,
      icon: BusIcon,
      color: "from-blue-500 to-cyan-500",
      savingTip: "Студенческий проездной дешевле на 30%",
    },
    {
      id: 4,
      category: "Доставка еды",
      amount: 3200,
      icon: UtensilsIcon,
      color: "from-green-500 to-emerald-500",
      savingTip: "Готовьте дома - экономия до ₽2000/мес",
    },
  ]);

  // цели из стора
  const { savings, isLoading, addGoal, updateGoal, removeGoal } = useSavings();

  // общая форма (и для добавления, и для редактирования)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // модалка про премиум
  const [showLimitModal, setShowLimitModal] = useState(false);

  if (isLoading || !savings) {
    return (
      <div className="p-4 w-full">
        <Card className="p-4">Загрузка целей…</Card>
      </div>
    );
  }

  const goals = savings.goals;

  // расходы — для инфо в шапке и блока "Где можно сэкономить"
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // статистика по накоплениям
  const totalSaved = goals.reduce((acc, g) => acc + g.saved, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const overallProgress =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const goalsCount = goals.length;

  const bestGoal = goals.reduce<SavingsGoal | null>((best, g) => {
    if (!g.target) return best;
    const curProgress = g.saved / g.target;
    const bestProgress = best && best.target ? best.saved / best.target : 0;
    if (!best || curProgress > bestProgress) return g;
    return best;
  }, null);

  const bestGoalText = bestGoal
    ? `${bestGoal.title} — ${Math.round(
      (bestGoal.saved / bestGoal.target) * 100
    )}%`
    : "Пока нет целей";

  // открыть форму ДОБАВЛЕНИЯ (внизу) с лимитом
  const openAddForm = () => {
    if (goals.length >= FREE_GOALS_LIMIT) {
      setShowLimitModal(true);
      return;
    }
    setEditingId(null);
    setGoalTitle("");
    setGoalSaved("");
    setGoalTarget("");
    setShowAddForm(true);
  };

  // открыть форму РЕДАКТИРОВАНИЯ прямо на карточке
  const openEditForm = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setGoalTitle(goal.title);
    setGoalSaved(goal.saved.toString());
    setGoalTarget(goal.target.toString());
    setShowAddForm(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setGoalTitle("");
    setGoalSaved("");
    setGoalTarget("");
    setShowAddForm(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("Удалить эту цель накопления?")) {
      removeGoal(id);
    }
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim() || !goalSaved || !goalTarget) {
      alert("Заполните все поля");
      return;
    }

    const saved = Number(goalSaved);
    const target = Number(goalTarget);
    if (isNaN(saved) || isNaN(target) || target <= 0) {
      alert("Проверьте суммы (должны быть числа, цель > 0)");
      return;
    }

    // повторная проверка лимита на случай рассинхрона
    if (!editingId && goals.length >= FREE_GOALS_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    if (editingId) {
      updateGoal(editingId, {
        title: goalTitle.trim(),
        saved,
        target,
      });
    } else {
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        title: goalTitle.trim(),
        saved,
        target,
      };
      addGoal(newGoal);
    }

    resetForm();
  };

  const handleOpenPremium = () => {
    if (setCurrentScreen) {
      setCurrentScreen("premium");
    }
  };

  return (
    <div className="p-4 space-y-4 w-full">
      {/* ВЕРХНЯЯ ШАПКА — про накопления */}
      <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl">Накопления</h2>
          <PiggyBankIcon className="w-8 h-8 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p className="text-sm opacity-90">Всего накоплено</p>
            <p className="text-3xl">₽{totalSaved.toLocaleString()}</p>
            <p className="text-1x1 opacity-80 mt-1">
              Целей: {goalsCount} / {FREE_GOALS_LIMIT}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Средний прогресс</p>
            <p className="text-3xl">{overallProgress}%</p>
            <p className="text-1x1 opacity-80 mt-1">
              Ближе всего к цели:
              <br />
              {bestGoalText}
            </p>
          </div>
        </div>

        <div className="text-1x1 opacity-80">
          Расходы в месяц (по анализу категорий): ₽
          {totalExpenses.toLocaleString()}
        </div>
      </Card>

      {/* Анализ расходов */}
      <div>
        <h3 className="text-sm mb-3 flex items-center gap-2">
          <TrendingDownIcon className="w-4 h-4 flex-shrink-0" />
          Где можно сэкономить
        </h3>
        <div className="space-y-3">
          {expenses.map((expense) => {
            const Icon = expense.icon;
            return (
              <Card key={expense.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${expense.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm">{expense.category}</h4>
                      <span className="font-semibold">
                        ₽{expense.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                      <p className="text-xs text-green-800">
                        💡 {expense.savingTip}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Цели накопления */}
      <div>
        <h3 className="text-sm mb-3">🎯 Цели накопления</h3>

        <div className="space-y-3">

          {/* Кнопка добавления НОВОЙ цели */}
          <Button
            onClick={openAddForm}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95"
          >
            <PlusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            Добавить накопление
          </Button>

          {/* Форма добавления новой цели внизу */}
          {showAddForm && editingId === null && (
            <Card className="p-4 border-2 border-green-200 mt-0">
              <h3 className="text-sm mb-3">Новая цель накопления</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Название (можно с эмодзи: 🚲 Велосипед)"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Уже накоплено"
                  value={goalSaved}
                  onChange={(e) => setGoalSaved(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Нужно накопить всего"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleSaveGoal}
                  >
                    Сохранить
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={resetForm}>
                    Отмена
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {goals.map((goal) => {
            const progress = goal.target
              ? Math.min(100, (goal.saved / goal.target) * 100)
              : 0;

            if (editingId === goal.id) {
              return (
                <Card key={goal.id} className="p-4 border-2 border-green-200">
                  <h3 className="text-sm mb-3">Изменение цели</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Название (можно с эмодзи: 💻 Новый ноутбук)"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Уже накоплено"
                      value={goalSaved}
                      onChange={(e) => setGoalSaved(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Нужно накопить всего"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleSaveGoal}
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={resetForm}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={goal.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">{goal.title}</h4>
                      <span className="text-sm text-gray-600">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>₽{goal.saved.toLocaleString()}</span>
                      <span>₽{goal.target.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => openEditForm(goal)}
                    >
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => handleDeleteGoal(goal.id)}
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
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h3 className="text-sm mb-2">💰 Студенческие лайфхаки</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Используйте студенческие скидки</li>
          <li>• Покупайте учебники б/у</li>
          <li>• Готовьте еду заранее на неделю</li>
          <li>• Отслеживайте акции в магазинах</li>
        </ul>
      </Card>

      {/* Модалка лимита целей — общая, такая же как у напоминаний */}
      <PremiumLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onOpenPremium={handleOpenPremium}
        limit={FREE_GOALS_LIMIT}
        entityLabel="целей накопления"
      />
    </div>
  );
}
