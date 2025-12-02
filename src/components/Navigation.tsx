import { HomeIcon, MoonIcon, PiggyBankIcon, BellIcon, BriefcaseIcon, UsersIcon } from './Icons';
import type { Screen } from '../App';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home' as Screen, icon: HomeIcon, label: 'Главная' },
    { id: 'sleep' as Screen, icon: MoonIcon, label: 'Сон' },
    { id: 'savings' as Screen, icon: PiggyBankIcon, label: 'Накопления' },
    { id: 'payments' as Screen, icon: BellIcon, label: 'Напоминания' },
    { id: 'jobs' as Screen, icon: BriefcaseIcon, label: 'Работа' },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-white border-t border-gray-200
        grid grid-cols-6
        h-16
        z-20
      "
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
    flex flex-col items-center justify-center
    py-3 px-1               /* ← основной паддинг */
    transition-colors active:scale-95
    ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-purple-500'}
  `}
          >
            <Icon className={`w-5 h-5 mb-2 ${isActive ? 'fill-purple-600' : ''}`} />
            <span className="text-[10px] leading-tight text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
