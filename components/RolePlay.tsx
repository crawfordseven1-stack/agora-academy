import React, { useState, useRef, useEffect } from 'react';
import { ROLEPLAY_SCENARIOS } from '../constants';
import { startChat, evaluateRolePlay } from '../services/geminiService';
import { ChatMessage } from '../types';

interface RolePlayProps {
  onPass: (score: number) => void;
}

const RolePlay: React.FC<RolePlayProps> = ({ onPass }) => {
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeScenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenario);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStart = async (scenarioId: string) => {
    setScenario(scenarioId);
    setEvaluation(null);
    setMessages([]);
    const s = ROLEPLAY_SCENARIOS.find(sc => sc.id === scenarioId);
    if (!s) return;

    setIsLoading(true);
    try {
      const chat = startChat(s.systemPrompt);
      setChatSession(chat);
      // Initial greeting from AI
      const response = await chat.sendMessage({ message: "Start call." });
      setMessages([{ role: 'model', text: response.text || "Hello?" }]);
    } catch (e) {
      console.error(e);
      setMessages([{ role: 'model', text: "System Error: Could not connect to AI simulator." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "..." }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    setIsLoading(true);
    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const result = await evaluateRolePlay(transcript);
    setEvaluation(result);
    setIsLoading(false);
  };

  const handleTryAgain = () => {
      if (scenario) {
          handleStart(scenario);
      }
  };

  const handleDownload = () => {
    if (!evaluation || !activeScenario) return;

    const reportContent = `
AGORA ACADEMY - ROLE PLAY REPORT
--------------------------------
Scenario: ${activeScenario.title}
Date: ${new Date().toLocaleDateString()}
Status: ${evaluation.passed ? 'PASSED' : 'FAILED'}
Score: ${evaluation.score}/100

FEEDBACK:
${evaluation.feedback}

TIPS FOR IMPROVEMENT:
${evaluation.tips?.map((t: string) => `- ${t}`).join('\n') || 'N/A'}

TRANSCRIPT:
--------------------------------
${messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agora_RolePlay_${scenario}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
      if (evaluation?.passed) {
          onPass(evaluation.score);
      } else {
          setScenario(null);
      }
  };

  if (!scenario) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ROLEPLAY_SCENARIOS.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 cursor-pointer transition-all" onClick={() => handleStart(s.id)}>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
            <p className="text-slate-600">{s.description}</p>
            <button className="mt-4 text-blue-600 font-semibold hover:underline">Start Simulation &rarr;</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 relative">
      {/* Header */}
      <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
        <div>
          <h3 className="font-bold">{activeScenario?.title}</h3>
          <p className="text-xs text-slate-300">Simulated Call</p>
        </div>
        {!evaluation && (
            <button 
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
                End Call & Evaluate
            </button>
        )}
        {evaluation && (
            <button 
                onClick={() => setScenario(null)}
                className="text-sm underline text-slate-300 hover:text-white"
            >
                Back to Menu
            </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400 text-sm animate-pulse">Connection active...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Evaluation Overlay */}
      {evaluation && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className={`text-2xl font-bold mb-2 ${evaluation.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.passed ? 'Simulation Passed!' : 'Assessment Failed'}
                </h2>
                <div className="text-4xl font-black text-slate-800 mb-4">{evaluation.score}<span className="text-lg font-normal text-slate-400">/100</span></div>
                
                <div className="mb-4">
                    <h4 className="font-bold text-slate-800 mb-1">Feedback:</h4>
                    <p className="text-slate-600 text-sm">{evaluation.feedback}</p>
                </div>

                {evaluation.tips && evaluation.tips.length > 0 && (
                    <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <h4 className="font-bold text-amber-900 mb-2 text-sm flex items-center">
                            <span className="mr-2">💡</span> Tips for Improvement:
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {evaluation.tips.map((tip: string, i: number) => (
                                <li key={i} className="text-sm text-amber-800">{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-6">
                     <button 
                        onClick={handleDownload}
                        className="col-span-2 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Report
                    </button>
                    <button 
                        onClick={handleTryAgain}
                        className="bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={handleFinish}
                        className={`py-3 rounded-lg font-semibold text-white transition-colors ${evaluation.passed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-500 hover:bg-slate-600'}`}
                    >
                        {evaluation.passed ? 'Complete Module' : 'Back to Menu'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Input Area */}
      {!evaluation && (
        <div className="p-4 bg-white border-t border-slate-200">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RolePlay;