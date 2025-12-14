import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: Record<number, any>) => void;
  initialAnswers?: Record<number, any>;
  readOnly?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, initialAnswers, readOnly = false }) => {
  const [answers, setAnswers] = useState<Record<number, any>>(initialAnswers || {});
  const [submitted, setSubmitted] = useState(!!initialAnswers);

  const handleSelect = (qId: number, val: any) => {
    if (submitted || readOnly) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      // loosely compare for index based answers
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    onComplete(score, answers);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            {idx + 1}. {q.text}
          </h3>
          
          <div className="space-y-2">
            {q.type === 'boolean' && (
              <>
                <button
                  onClick={() => handleSelect(q.id, true)}
                  disabled={readOnly}
                  className={`w-full text-left px-4 py-3 rounded-md border ${
                    answers[q.id] === true 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  True
                </button>
                <button
                  onClick={() => handleSelect(q.id, false)}
                  disabled={readOnly}
                  className={`w-full text-left px-4 py-3 rounded-md border ${
                    answers[q.id] === false 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  False
                </button>
              </>
            )}

            {q.type === 'multiple_choice' && q.options?.map((opt, optIdx) => (
              <button
                key={optIdx}
                onClick={() => handleSelect(q.id, optIdx)}
                disabled={readOnly}
                className={`w-full text-left px-4 py-3 rounded-md border ${
                  answers[q.id] === optIdx
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {(submitted || readOnly) && (
            <div className={`mt-4 p-4 rounded-md ${answers[q.id] === q.correctAnswer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-semibold">{answers[q.id] === q.correctAnswer ? 'Correct!' : 'Incorrect.'}</p>
              <p className="text-sm mt-1">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        !submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="w-full bg-slate-100 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            Retake Quiz
          </button>
        )
      )}
    </div>
  );
};

export default Quiz;