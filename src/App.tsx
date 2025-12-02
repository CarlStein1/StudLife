import { useState } from 'react';
import { Home } from './components/Home';
import { SleepTracker } from './components/SleepTracker';
import { SavingsTracker } from './components/SavingsTracker';
import { PaymentReminders } from './components/PaymentReminders';
import { JobGuide } from './components/JobGuide';
import { Premium } from './components/Premium';
import { Navigation } from './components/Navigation';

export type Screen = 'home' | 'sleep' | 'savings' | 'payments' | 'jobs' | 'premium';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={setCurrentScreen} />;
      case 'sleep':
        return <SleepTracker />;
      case 'savings':
        return <SavingsTracker setCurrentScreen={setCurrentScreen} />;
      case 'payments':
        // передаём setCurrentScreen, чтобы из напоминаний можно было открыть Premium
        return <PaymentReminders setCurrentScreen={setCurrentScreen} />;
      case 'jobs':
        return <JobGuide />;
      case 'premium':
        return <Premium />;
      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Мобильный контейнер */}
      <div className="w-full min-h-screen bg-white shadow-xl relative flex flex-col">
        {/* Хедер с фиксированным отступом слева */}
        <div
          className="
            sticky top-0 z-20 safe-top
            bg-gradient-to-r from-purple-600 to-blue-600
            text-white px-4 py-4
            shadow-md rounded-b-3xl
          "
        >
          <div className="flex items-center justify-between w-full">
            {/* Название — фикс. отступ за счёт px-4 у родителя */}
            <h1
              className="
                text-2xl font-semibold tracking-wide
                drop-shadow-sm select-none
              "
            >
              StudLife
            </h1>

            {/* Кнопка Premium */}
            <button
              onClick={() => setCurrentScreen('premium')}
              className="
                px-4 py-1
                bg-white/20 backdrop-blur-md
                text-white text-sm font-medium
                rounded-full flex items-center gap-1
                hover:bg-white/30 active:scale-95
                transition-all
              "
            >
              Premium ⭐
            </button>
          </div>
        </div>

        {/* Контент - прокручиваемая область */}
        <div className="flex-1 overflow-y-auto safe-bottom">
          <div className="max-w-screen-sm mx-auto">
            {renderScreen()}
          </div>
        </div>

        {/* Нижняя навигация */}
        <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </div>
    </div>
  );
}
