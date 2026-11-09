import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/bridgeData';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

export const QuizSection: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = QUIZ_QUESTIONS.length;

  const score = Object.entries(userAnswers).reduce((acc, [qId, ansIdx]) => {
    const q = QUIZ_QUESTIONS.find((item) => item.id === Number(qId));
    return q && q.correctIndex === ansIdx ? acc + 1 : acc;
  }, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    if (score >= 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          발표 청중 및 연구자 개념 검증 퀴즈
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          교량 구조와 수학적 함수 이해도 평가
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          발표를 경청한 청중들이 아치교와 현수교의 함수적 차이(현수선 vs 포물선), 가우디의 역학 원리, 테일러 급수 해석을 올바르게 이해했는지 테스트합니다.
        </p>

        {submitted && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 inline-block">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">최종 득점</span>
            <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
              {score} / {totalQuestions}{' '}
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({Math.round((score / totalQuestions) * 100)}점)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {score === 5
                ? '축하합니다! 교량 구조역학과 고등 미적분의 핵심을 완벽히 마스터하셨습니다.'
                : score >= 3
                ? '훌륭합니다! 교량의 함수적 차이와 하중 전달 구조를 정확히 파악하셨습니다.'
                : '다시 한 번 발표 자료와 수식 유도실을 살펴보시면 더 명확히 이해하실 수 있습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const selectedAns = userAnswers[q.id];
          const isCorrect = selectedAns === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20'
                    : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                  Q0{idx + 1}
                </span>
                <div className="space-y-4 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedAns === optIdx;
                      let optionStyle =
                        'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

                      if (isOptionSelected) {
                        optionStyle =
                          'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold ring-1 ring-sky-500';
                      }

                      if (submitted) {
                        if (optIdx === q.correctIndex) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold ring-1 ring-emerald-500';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle =
                            'border-rose-500 bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500 line-through';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                          )}
                          {submitted && isOptionSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submitted && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        해설 (Explanation):
                      </span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 py-4">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions}
            className="px-6 py-3 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>답안 제출 및 채점하기 ({answeredCount}/{totalQuestions})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>퀴즈 다시 풀기</span>
          </button>
        )}
      </div>
    </div>
  );
};
