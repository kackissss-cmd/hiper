import React, { useState, useEffect } from 'react';
import { NavigationTab } from './types/bridge';
import { Navbar } from './components/Navbar';
import { PresentationMode } from './components/PresentationMode';
import { SimulationLab } from './components/SimulationLab';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { DerivationLab } from './components/DerivationLab';
import { RealBridgeCalculator } from './components/RealBridgeCalculator';
import { QuizSection } from './components/QuizSection';
import { 
  Presentation, 
  Compass, 
  Layers, 
  Sigma, 
  Calculator, 
  Award,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('presentation');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-sky-500 selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Research Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Research Topic Header Banner */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-sky-600 dark:text-sky-400">고등학교 수학·과학 융합 탐구</span>
                <span aria-hidden="true">·</span>
                <span>패들릿(Padlet) 심층 분석</span>
                <span aria-hidden="true">·</span>
                <span>현수선 vs 2차 포물선 비교</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                아치교와 현수교는 왜 서로 다른 함수일까?
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                "곡선 다리는 모두 2차함수일까?"라는 일상의 의문에서 출발하여, 어려운 대학 미분방정식 없이 <strong>고등학교 수학(이차함수·지수함수)</strong>과 <strong>물리학 I(힘의 평형)</strong> 지식만으로 두 곡선의 비밀과 5대 다리의 구조적 차이를 밝혀낸 발표 자료입니다.
              </p>
            </div>

            {/* Quick Action Badges / Reference Links */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <a
                href="https://padlet.com/kackissss/padlet-s023fzhkc9iwcloxj9ww"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <span>참조한 패들릿(Padlet) 원문</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setCurrentTab('simulation')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>곡선 비교 실험실 열기</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs for Mobile / Quick Access */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setCurrentTab('presentation')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'presentation'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              발표 슬라이드 (8매 & 대본)
            </button>

            <button
              onClick={() => setCurrentTab('simulation')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'simulation'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              인터랙티브 곡선 실험실
            </button>

            <button
              onClick={() => setCurrentTab('comparison')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'comparison'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              5대 다리 구조 비교
            </button>

            <button
              onClick={() => setCurrentTab('derivation')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'derivation'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sigma className="w-3.5 h-3.5" />
              고교 수학으로 푸는 원리
            </button>

            <button
              onClick={() => setCurrentTab('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'calculator'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              실제 다리 계산기
            </button>

            <button
              onClick={() => setCurrentTab('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentTab === 'quiz'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              발표 확인 퀴즈
            </button>
          </div>
        </section>

        {/* Dynamic Tab Body */}
        <section className="transition-opacity duration-200">
          {currentTab === 'presentation' && (
            <PresentationMode
              onNavigateToSim={() => setCurrentTab('simulation')}
              onNavigateToDerivation={() => setCurrentTab('derivation')}
            />
          )}

          {currentTab === 'simulation' && <SimulationLab />}

          {currentTab === 'comparison' && <ComparisonMatrix />}

          {currentTab === 'derivation' && <DerivationLab />}

          {currentTab === 'calculator' && <RealBridgeCalculator />}

          {currentTab === 'quiz' && <QuizSection />}
        </section>
      </main>

      {/* Clean Academic Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-6 text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              교량 구조의 수학과 공학적 원리 탐구 보고서
            </span>
            <span aria-hidden="true">·</span>
            <span>수학·물리 융합 연구 발표</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Form Follows Force: 형태는 힘을 따른다</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              맨 위로 이동 ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
