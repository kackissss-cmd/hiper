import React from 'react';
import { NavigationTab } from '../types/bridge';
import { Presentation, Compass, Layers, Sigma, Calculator, Award, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Zone 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#presentation"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('presentation');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 bg-sky-600 rounded-xs inline-block" />
          교량 구조의 수학과 공학
        </a>
      </div>

      {/* Zone 2: 4-5 single-line clean text links with functional tab switches */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectTab('presentation')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'presentation'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Presentation className="w-4 h-4" />
          발표 자료
        </button>

        <button
          onClick={() => onSelectTab('simulation')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'simulation'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          곡선 실험실
        </button>

        <button
          onClick={() => onSelectTab('comparison')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'comparison'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          5대 다리 비교
        </button>

        <button
          onClick={() => onSelectTab('derivation')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'derivation'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sigma className="w-4 h-4" />
          고교 수학 원리
        </button>

        <button
          onClick={() => onSelectTab('calculator')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'calculator'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          실제 다리 계산
        </button>
      </nav>

      {/* Zone 3: 1 primary action + theme toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onSelectTab('quiz')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentTab === 'quiz'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-slate-800 dark:hover:bg-sky-500'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          탐구 퀴즈 풀기
        </button>
      </div>
    </header>
  );
};
