import React, { useState, useEffect, useRef } from 'react';
import { MODULES, M0_QUIZ, M1_QUIZ, M3_QUIZ, M5_QUIZ, AVAILABLE_BADGES } from './constants';
import { ModuleId, ModuleStatus, UserProgress, UserProfile } from './types';
import Quiz from './components/Quiz';
import RolePlay from './components/RolePlay';
import LeadForm from './components/LeadForm';
import { 
  getActiveProfile, 
  setActiveProfile, 
  clearActiveProfile, 
  saveProgress, 
  loadProgress, 
  exportData, 
  generateProfileId 
} from './services/storageService';

// Initial state constant
const INITIAL_PROGRESS: UserProgress = {
  modules: {
    'dashboard': { status: ModuleStatus.COMPLETED },
    'm0': { status: ModuleStatus.IN_PROGRESS },
    'm1': { status: ModuleStatus.LOCKED },
    'm2': { status: ModuleStatus.LOCKED },
    'm3': { status: ModuleStatus.LOCKED },
    'm4': { status: ModuleStatus.LOCKED },
    'm5': { status: ModuleStatus.LOCKED },
    'm6': { status: ModuleStatus.LOCKED },
    'm7': { status: ModuleStatus.LOCKED },
    'admin': { status: ModuleStatus.IN_PROGRESS }
  },
  totalPoints: 0,
  badges: []
};

// Helper components
const SidebarItem: React.FC<{ active: boolean, title: string, status: ModuleStatus, onClick: () => void }> = ({ active, title, status, onClick }) => {
  const isLocked = status === ModuleStatus.LOCKED;
  return (
    <button 
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between transition-colors ${
        active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="truncate pr-2">{title}</span>
      {status === ModuleStatus.COMPLETED && <span className="text-green-500">✓</span>}
      {status === ModuleStatus.LOCKED && <span className="text-slate-400">🔒</span>}
    </button>
  );
};

const ContentBlock: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="prose prose-slate max-w-none text-slate-600">
            {children}
        </div>
    </div>
);

const App = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [m0Tab, setM0Tab] = useState(0);
  const [retaking, setRetaking] = useState(false);
  const [newBadgeAlert, setNewBadgeAlert] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile on mount
  useEffect(() => {
    const profile = getActiveProfile();
    if (profile) {
      setUserProfile(profile);
      const savedProgress = loadProgress(profile);
      if (savedProgress) {
        setProgress(savedProgress);
      }
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (userProfile && progress) {
      saveProgress(userProfile, progress);
    }
  }, [progress, userProfile]);

  // Reset retake state when switching modules
  useEffect(() => {
    setRetaking(false);
  }, [activeModule]);

  const handleLogin = (agentName: string) => {
    const newProfile: UserProfile = {
      agentName,
      profileId: generateProfileId(),
      createdAt: Date.now()
    };
    setUserProfile(newProfile);
    setActiveProfile(newProfile);
    setProgress(INITIAL_PROGRESS); // Start fresh for new profile
  };

  const handleLogout = () => {
    clearActiveProfile();
    setUserProfile(null);
    setProgress(INITIAL_PROGRESS);
    setActiveModule('dashboard');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile && data.progress) {
          setUserProfile(data.profile);
          setActiveProfile(data.profile);
          setProgress(data.progress);
          saveProgress(data.profile, data.progress);
          alert('Progress imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse file');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Unlock logic
  const completeModule = (id: ModuleId, score: number = 100, answers?: Record<number, any>) => {
    setProgress(prev => {
      const newModules = { ...prev.modules };
      newModules[id] = { status: ModuleStatus.COMPLETED, score, answers };
      
      // Unlock next module logic
      const order: ModuleId[] = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'];
      const idx = order.indexOf(id);
      if (idx >= 0 && idx < order.length - 1) {
        const nextId = order[idx + 1];
        if (newModules[nextId].status === ModuleStatus.LOCKED) {
           newModules[nextId].status = ModuleStatus.IN_PROGRESS;
        }
      }

      // Check Badges
      const currentBadges = new Set(prev.badges);
      let newlyEarned: string | null = null;

      // Logic for each badge
      if (id === 'm0' && score >= 90) currentBadges.add('scholar');
      if (id === 'm1' && score === 100) currentBadges.add('compliance');
      if (id === 'm2' && score >= 90) currentBadges.add('negotiator');
      if (id === 'm3' && score === 100) currentBadges.add('detective');
      if (id === 'm5' && score === 100) currentBadges.add('finance');
      if (id === 'm7') currentBadges.add('certified');

      // Check if a new badge was actually added
      if (currentBadges.size > prev.badges.length) {
          // Find the newest one
          const diff = [...currentBadges].filter(x => !prev.badges.includes(x));
          if (diff.length > 0) {
              const badgeDef = AVAILABLE_BADGES.find(b => b.id === diff[0]);
              if (badgeDef) newlyEarned = badgeDef.name;
          }
      }

      if (newlyEarned) {
          setNewBadgeAlert(newlyEarned);
          setTimeout(() => setNewBadgeAlert(null), 3000);
      }

      return {
        ...prev,
        modules: newModules,
        totalPoints: prev.totalPoints + score,
        badges: Array.from(currentBadges)
      };
    });
    window.scrollTo(0,0);
  };

  // Login Screen
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900 mb-2">AGORA <span className="text-blue-600">ACADEMY</span></h1>
          <p className="text-slate-500 mb-8">Select your agent profile to begin.</p>
          
          <div className="space-y-4">
            {['Agent Steve', 'Agent Betty', 'Agent Sora'].map(agent => (
              <button
                key={agent}
                onClick={() => handleLogin(agent)}
                className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold py-4 rounded-xl transition-all flex items-center justify-between px-6 group"
              >
                <span>{agent}</span>
                <span className="text-slate-300 group-hover:text-blue-500">&rarr;</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-slate-400 hover:text-slate-600 underline"
             >
               Import existing progress file
             </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back, {userProfile.agentName}</h1>
                    <p className="opacity-90 max-w-2xl">Your journey to becoming a top-tier funding affiliate starts here. Complete the Education Center to unlock advanced training and live lead portals.</p>
                    
                    <div className="mt-6 flex space-x-6">
                        <div>
                            <div className="text-2xl font-bold">{progress.totalPoints}</div>
                            <div className="text-xs opacity-75 uppercase tracking-wide">XP Earned</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {Object.values(progress.modules).filter((m: any) => m.status === ModuleStatus.COMPLETED).length - 1}/8
                            </div>
                            <div className="text-xs opacity-75 uppercase tracking-wide">Modules Done</div>
                        </div>
                         <div>
                            <div className="text-2xl font-bold">{progress.badges.length}</div>
                            <div className="text-xs opacity-75 uppercase tracking-wide">Badges</div>
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => exportData(userProfile, progress)}
                      className="mt-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Backup Progress
                    </button>
                </div>
                {/* Decoration */}
                <div className="absolute right-0 top-0 h-64 w-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             </div>

             {/* Badges Section */}
             <div>
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Your Achievements</h2>
                 {progress.badges.length === 0 ? (
                     <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 border border-slate-200 border-dashed">
                         No badges earned yet. Complete modules with high scores to unlock them!
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {progress.badges.map(badgeId => {
                             const b = AVAILABLE_BADGES.find(ab => ab.id === badgeId);
                             if (!b) return null;
                             return (
                                 <div key={b.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col items-center text-center">
                                     <div className="text-4xl mb-2">{b.icon}</div>
                                     <h3 className="font-bold text-sm text-slate-800 leading-tight">{b.name}</h3>
                                     <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                                 </div>
                             );
                         })}
                     </div>
                 )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map(m => (
                    <div 
                        key={m.id} 
                        onClick={() => progress.modules[m.id].status !== ModuleStatus.LOCKED && setActiveModule(m.id)}
                        className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all relative ${
                            progress.modules[m.id].status === ModuleStatus.LOCKED 
                                ? 'opacity-60 grayscale cursor-not-allowed' 
                                : 'hover:shadow-md cursor-pointer hover:border-blue-300'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">{m.duration}</span>
                            {progress.modules[m.id].status === ModuleStatus.COMPLETED && (
                                <span className="text-green-500 font-bold">Completed</span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{m.title}</h3>
                        <p className="text-sm text-slate-500">{m.description}</p>
                    </div>
                ))}
             </div>
          </div>
        );

      case 'm0':
        const tabs = ["Overview", "Products", "ICP", "Workflow", "Commission", "Trust", "Final Exam"];
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 border-b border-slate-200 flex space-x-4 overflow-x-auto">
                    {tabs.map((tab, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setM0Tab(idx)}
                            className={`pb-2 px-1 text-sm font-medium whitespace-nowrap transition-colors ${m0Tab === idx ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {m0Tab === 0 && (
                    <ContentBlock title="Company Overview">
                        <div className="space-y-4">
                            <p><strong>Mission:</strong> To bridge the funding gap for underrepresented entrepreneurs and small businesses who are often overlooked by traditional banks.</p>
                            <p><strong>History:</strong> Agora Enterprises was founded in 2022 by <strong>Darren Crawford</strong>.</p>
                            <p><strong>Your Role:</strong> As an Affiliate, you are an <em>Independent Contractor</em>. Your primary duty is to educate clients, gather documentation, and facilitate connections. You must uphold the highest standards of <strong>Compliance</strong> and <strong>Ethical Marketing</strong>.</p>
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-900">
                                <strong>Critical Rule:</strong> Never guarantee loan approvals, specific rates, or exact funding timelines. We are a marketplace/brokerage, not the final lender.
                            </div>
                        </div>
                    </ContentBlock>
                )}

                {m0Tab === 1 && (
                    <ContentBlock title="Financial Products">
                        <div className="grid gap-4">
                            <div className="bg-white p-4 border rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg text-blue-900">1. 0% Business Credit Cards</h3>
                                <p className="text-sm mt-1">Ideal for startups or operating expenses. Provides 0% APR for an introductory period (usually 6-18 months).</p>
                            </div>
                            <div className="bg-white p-4 border rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg text-blue-900">2. Line of Credit (LOC)</h3>
                                <p className="text-sm mt-1">Revolving funds. You only pay interest on what you use. Great for cash flow management.</p>
                            </div>
                            <div className="bg-white p-4 border rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg text-blue-900">3. Term Loans</h3>
                                <p className="text-sm mt-1">Lump sum cash with fixed payments. Best for equipment purchases or large one-time investments.</p>
                            </div>
                            <div className="bg-white p-4 border rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg text-blue-900">4. SBA Loans</h3>
                                <p className="text-sm mt-1">Government-backed (Small Business Administration). Low down payments and long terms, but requires strict paperwork.</p>
                            </div>
                        </div>
                    </ContentBlock>
                )}

                {m0Tab === 2 && (
                     <ContentBlock title="Ideal Customer Profile (ICP)">
                        <p>Focus your energy on High-Quality Leads to ensure faster funding and higher approval rates.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-bold text-green-800 mb-2">✅ High-Quality Leads</h4>
                                <ul className="list-disc pl-4 space-y-1 text-sm text-green-900">
                                    <li><strong>2+ Years</strong> in Business</li>
                                    <li><strong>$20,000+</strong> Monthly Revenue</li>
                                    <li><strong>680+</strong> Credit Score</li>
                                    <li>Responsive Owner & Clear Use of Funds</li>
                                    <li>Access to <strong>Business Bank Statements</strong></li>
                                </ul>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <h4 className="font-bold text-red-800 mb-2">🚩 Red Flags</h4>
                                <ul className="list-disc pl-4 space-y-1 text-sm text-red-900">
                                    <li>Less than 2 years in business (Startups)</li>
                                    <li>Revenue under $20k/mo</li>
                                    <li>Credit Score under 680</li>
                                    <li>Requesting funds for personal use (Rent, Car)</li>
                                    <li>No verifiable bank statements</li>
                                </ul>
                            </div>
                        </div>
                     </ContentBlock>
                )}

                {m0Tab === 3 && (
                    <ContentBlock title="Affiliate Workflow">
                        <ol className="relative border-l border-slate-200 ml-4 space-y-6">
                            <li className="mb-4 ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">1</span>
                                <h3 className="font-semibold text-lg">Lead Discovery</h3>
                                <p className="text-sm">Network with local businesses, referrals, and trade groups. Build trust first.</p>
                            </li>
                            <li className="mb-4 ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">2</span>
                                <h3 className="font-semibold text-lg">Pre-Qualification</h3>
                                <p className="text-sm">Ask the hard questions: Monthly Revenue? Time in Business? Existing Loans? Timeline?</p>
                            </li>
                            <li className="mb-4 ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">3</span>
                                <h3 className="font-semibold text-lg">Handoff</h3>
                                <p className="text-sm">Submit a "Clean File" to the closer. This includes all notes and accurate contact info.</p>
                            </li>
                        </ol>
                    </ContentBlock>
                )}

                {m0Tab === 4 && (
                    <ContentBlock title="Commission & Financial Reality">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                                <span>Commission Rate (Tier 1)</span>
                                <span className="font-bold text-xl">50% <span className="text-sm font-normal text-slate-500">of Net Revenue</span></span>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                                <span>Payment Schedule</span>
                                <span className="font-bold text-right">1st & 15th <br/><span className="text-sm font-normal text-slate-500">3 days after funding</span></span>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-red-800">
                                <strong>Clawback Policy:</strong> If a client defaults within the first <strong>45 days</strong>, the full commission must be returned. This ensures we only fund viable businesses.
                            </div>
                        </div>
                    </ContentBlock>
                )}

                {m0Tab === 5 && (
                    <ContentBlock title="Trust & Relationship Principles">
                         <p>We play the long game. Your reputation is your most valuable asset.</p>
                         <ul className="list-disc pl-5 mt-4 space-y-2">
                             <li><strong>Education First:</strong> Don't "sell" money. Educate the client on how capital can grow their business.</li>
                             <li><strong>Empathy:</strong> Listen to their pain points. If we aren't a fit, tell them honestly.</li>
                             <li><strong>Boundaries:</strong> Set expectations early. Do not let desperate clients push you into making compliance errors.</li>
                         </ul>
                    </ContentBlock>
                )}

                {m0Tab === 6 && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                        <h3 className="font-bold text-blue-900 mb-2">Education Center Final Exam</h3>
                        <p className="text-blue-700 mb-4">Pass with 85% or higher to unlock the Training Modules.</p>
                        {progress.modules.m0.status === ModuleStatus.COMPLETED && !retaking ? (
                            <div>
                                <div className="bg-white p-6 rounded-xl border border-green-200 text-center mb-6">
                                    <div className="text-green-600 font-bold text-xl mb-2">Module Completed!</div>
                                    <p className="text-slate-600 mb-4">Score: {progress.modules.m0.score}%</p>
                                    <button onClick={() => setRetaking(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200">Retake Exam</button>
                                </div>
                                <div className="pointer-events-none opacity-80">
                                    <Quiz questions={M0_QUIZ} onComplete={() => {}} initialAnswers={progress.modules.m0.answers} readOnly={true} />
                                </div>
                            </div>
                        ) : (
                            <Quiz questions={M0_QUIZ} onComplete={(score, answers) => {
                                if (score >= 85) {
                                    completeModule('m0', score, answers);
                                    setRetaking(false);
                                } else {
                                    alert('Score too low. Review the material and try again.');
                                }
                            }} />
                        )}
                    </div>
                )}
            </div>
        );

      case 'm1':
        return (
          <div className="max-w-4xl mx-auto">
            <ContentBlock title="Intro & Compliance">
              <p>As an independent contractor for Agora Enterprises, compliance is your shield. The funding industry is regulated, and ethical marketing is paramount.</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>No Guarantees:</strong> Never promise a loan approval or specific rate.</li>
                <li><strong>Transparency:</strong> Clearly explain that we are a broker/marketplace, not a direct bank.</li>
                <li><strong>Data Privacy:</strong> Protect client documents (bank statements, tax returns) at all costs.</li>
              </ul>
            </ContentBlock>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                <h3 className="font-bold text-blue-900 mb-2">Module Quiz</h3>
                <p className="text-blue-700 mb-4">Pass with 100% to unlock the next module.</p>
                {progress.modules.m1.status === ModuleStatus.COMPLETED && !retaking ? (
                     <div>
                        <div className="bg-white p-6 rounded-xl border border-green-200 text-center mb-6">
                            <div className="text-green-600 font-bold text-xl mb-2">Module Completed!</div>
                            <p className="text-slate-600 mb-4">Score: {progress.modules.m1.score}%</p>
                            <button onClick={() => setRetaking(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200">Retake Quiz</button>
                        </div>
                         <div className="pointer-events-none opacity-80">
                            <Quiz questions={M1_QUIZ} onComplete={() => {}} initialAnswers={progress.modules.m1.answers} readOnly={true} />
                        </div>
                    </div>
                ) : (
                    <Quiz questions={M1_QUIZ} onComplete={(score, answers) => {
                        if (score === 100) {
                            completeModule('m1', score, answers);
                            setRetaking(false);
                        } else {
                            alert('You need 100% to pass.');
                        }
                    }} />
                )}
            </div>
          </div>
        );

      case 'm2':
        return (
          <div className="max-w-4xl mx-auto">
             <ContentBlock title="Discovery Call Role-Play">
                <p>Mastering the discovery call is about listening, not selling. You will now enter a simulation with our AI personas. You must demonstrate empathy, compliance, and control.</p>
             </ContentBlock>
             {progress.modules.m2.status === ModuleStatus.COMPLETED ? (
                <div className="text-green-600 font-bold bg-white p-8 rounded text-center border border-green-200">
                    Role-Play Mastered! You have demonstrated the ability to handle various client types.
                </div>
             ) : (
                 <RolePlay onPass={(score) => completeModule('m2', score)} />
             )}
          </div>
        );

      case 'm3':
        return (
          <div className="max-w-4xl mx-auto">
             <ContentBlock title="ICP & Lead Qualification">
                <p>We do not fund everyone. Our Ideal Customer Profile (ICP) ensures high approval rates.</p>
                <div className="overflow-hidden rounded-lg border border-slate-200 my-6">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr><th className="px-6 py-3 text-left font-bold text-slate-700">Criteria</th><th className="px-6 py-3 text-left font-bold text-slate-700">Requirement</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr><td className="px-6 py-3">Monthly Revenue</td><td className="px-6 py-3"><strong>$20,000+</strong> (Last 3 months)</td></tr>
                            <tr><td className="px-6 py-3">Time in Business</td><td className="px-6 py-3"><strong>2+ Years</strong></td></tr>
                            <tr><td className="px-6 py-3">Credit Score</td><td className="px-6 py-3"><strong>680+</strong> (720+ Preferred)</td></tr>
                            <tr><td className="px-6 py-3">Documentation</td><td className="px-6 py-3">3-6 Months Bank Statements</td></tr>
                            <tr><td className="px-6 py-3">Restricted Ind.</td><td className="px-6 py-3">Adult, Gambling, Attorneys, Non-Profits</td></tr>
                        </tbody>
                    </table>
                </div>
             </ContentBlock>
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                <h3 className="font-bold text-blue-900 mb-2">Qualification Quiz</h3>
                {progress.modules.m3.status === ModuleStatus.COMPLETED && !retaking ? (
                    <div>
                        <div className="bg-white p-6 rounded-xl border border-green-200 text-center mb-6">
                            <div className="text-green-600 font-bold text-xl mb-2">Module Completed!</div>
                            <p className="text-slate-600 mb-4">Score: {progress.modules.m3.score}%</p>
                            <button onClick={() => setRetaking(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200">Retake Quiz</button>
                        </div>
                        <div className="pointer-events-none opacity-80">
                            <Quiz questions={M3_QUIZ} onComplete={() => {}} initialAnswers={progress.modules.m3.answers} readOnly={true} />
                        </div>
                    </div>
                ) : (
                    <Quiz questions={M3_QUIZ} onComplete={(score, answers) => {
                        if (score >= 50) {
                            completeModule('m3', score, answers);
                            setRetaking(false);
                        } else {
                            alert('Score too low.');
                        }
                    }} />
                )}
            </div>
          </div>
        );

      case 'm4':
        return (
           <div className="max-w-4xl mx-auto">
             <ContentBlock title="Affiliate → Closer Handoff SOP">
                <p>Once a lead is qualified, you must submit it cleanly. Incomplete submissions delay funding by 48+ hours.</p>
                <p className="mt-2 text-sm text-slate-500 italic">This is a simulation of the Google Form you will use in production.</p>
             </ContentBlock>
             {progress.modules.m4.status === ModuleStatus.COMPLETED ? (
                 <div className="text-green-600 font-bold bg-white p-8 rounded text-center border border-green-200">
                    SOP Acknowledged & Practiced.
                </div>
             ) : (
                 <LeadForm onPass={() => completeModule('m4')} />
             )}
           </div>
        );

      case 'm5':
        return (
            <div className="max-w-4xl mx-auto">
             <ContentBlock title="Commission & Financial Reality">
                <p>Understanding your compensation structure is vital.</p>
                <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="bg-green-50 p-4 rounded border border-green-100">
                        <div className="text-2xl font-bold text-green-700">50%</div>
                        <div className="text-sm text-green-800">Of Net Revenue (Tier 1)</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded border border-red-100">
                        <div className="text-2xl font-bold text-red-700">Clawback</div>
                        <div className="text-sm text-red-800">If client defaults &lt; 45 days</div>
                    </div>
                </div>
             </ContentBlock>
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                <h3 className="font-bold text-blue-900 mb-2">Finance Quiz</h3>
                {progress.modules.m5.status === ModuleStatus.COMPLETED && !retaking ? (
                    <div>
                         <div className="bg-white p-6 rounded-xl border border-green-200 text-center mb-6">
                            <div className="text-green-600 font-bold text-xl mb-2">Module Completed!</div>
                            <p className="text-slate-600 mb-4">Score: {progress.modules.m5.score}%</p>
                            <button onClick={() => setRetaking(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200">Retake Quiz</button>
                        </div>
                        <div className="pointer-events-none opacity-80">
                            <Quiz questions={M5_QUIZ} onComplete={() => {}} initialAnswers={progress.modules.m5.answers} readOnly={true} />
                        </div>
                    </div>
                ) : (
                    <Quiz questions={M5_QUIZ} onComplete={(score, answers) => {
                        if (score >= 50) {
                            completeModule('m5', score, answers);
                            setRetaking(false);
                        } else {
                            alert('Score too low.');
                        }
                    }} />
                )}
            </div>
           </div>
        );

      case 'm6':
         return (
             <div className="max-w-4xl mx-auto">
                 <ContentBlock title="Lead Practice System">
                    <p>Use this tool to practice vetting leads before you submit them to the real CRM. Our AI will analyze your entry for weak points.</p>
                 </ContentBlock>
                 <LeadForm onPass={() => completeModule('m6')} isTrainingMode={true} />
             </div>
         );

      case 'm7':
          return (
              <div className="max-w-4xl mx-auto text-center py-12">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">Final Certification</h2>
                  {Object.values(progress.modules).filter((m: any) => m.status === ModuleStatus.COMPLETED).length >= 7 ? (
                      <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-amber-200 inline-block relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl">OFFICIAL</div>
                          <h1 className="text-4xl font-serif text-slate-900 mb-2">Certificate of Completion</h1>
                          <p className="text-slate-500 mb-8">This certifies that</p>
                          <p className="text-3xl font-bold text-blue-900 mb-8 border-b-2 border-slate-200 inline-block px-12 pb-2">{userProfile?.agentName}</p>
                          <p className="text-slate-600">Has successfully completed the Agora Affiliate Training</p>
                          <p className="text-slate-400 text-sm mt-8">{new Date().toLocaleDateString()}</p>
                          
                          <button onClick={() => window.print()} className="mt-8 bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-700 no-print">
                              Print Certificate
                          </button>
                      </div>
                  ) : (
                      <div className="bg-red-50 text-red-800 p-6 rounded-lg inline-block">
                          Please complete all previous modules to unlock your certification.
                      </div>
                  )}
              </div>
          );

      case 'admin':
          return (
              <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-800">Manager Dashboard</h2>
                      <button className="text-blue-600 font-semibold hover:underline">Export CSV</button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                              <tr>
                                  <th className="px-6 py-3 text-left font-medium text-slate-500">Affiliate</th>
                                  <th className="px-6 py-3 text-left font-medium text-slate-500">Progress</th>
                                  <th className="px-6 py-3 text-left font-medium text-slate-500">M0 Exam</th>
                                  <th className="px-6 py-3 text-left font-medium text-slate-500">M2 Role-Play</th>
                                  <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {[
                                  { name: `${userProfile?.agentName} (You)`, progress: '12%', m0: 'Pending', m2: 'Locked', status: 'Active' },
                                  { name: 'John Smith', progress: '14%', m0: '80%', m2: 'Pending', status: 'At Risk' },
                                  { name: 'Sarah Wilson', progress: '100%', m0: '100%', m2: 'Passed', status: 'Certified' },
                                  { name: 'Mike Brown', progress: '42%', m0: '90%', m2: 'Failed', status: 'Active' },
                              ].map((row, i) => (
                                  <tr key={i} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                                      <td className="px-6 py-4">
                                          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                                              <div className="bg-blue-600 h-2 rounded-full" style={{width: row.progress}}></div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">{row.m0}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                              row.m2 === 'Passed' ? 'bg-green-100 text-green-700' : 
                                              row.m2 === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                          }`}>{row.m2}</span>
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">{row.status}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Toast Notification for Badges */}
      {newBadgeAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
            <div className="bg-amber-100 border border-amber-300 text-amber-900 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                <span className="text-3xl">🏅</span>
                <div>
                    <div className="font-bold">Badge Unlocked!</div>
                    <div className="text-sm">{newBadgeAlert}</div>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">AGORA <span className="text-blue-600">ACADEMY</span></h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <SidebarItem active={activeModule === 'dashboard'} title="Dashboard" status={progress.modules.dashboard.status} onClick={() => setActiveModule('dashboard')} />
          <div className="my-4 border-t border-slate-100"></div>
          {MODULES.map(m => (
             <SidebarItem 
                key={m.id} 
                active={activeModule === m.id} 
                title={m.title} 
                status={progress.modules[m.id].status} 
                onClick={() => setActiveModule(m.id)} 
             />
          ))}
           <div className="my-4 border-t border-slate-100"></div>
           <SidebarItem active={activeModule === 'admin'} title="Manager View" status={ModuleStatus.IN_PROGRESS} onClick={() => setActiveModule('admin')} />
        </nav>
        <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {userProfile.agentName.substring(6, 8).toUpperCase()}
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-800">{userProfile.agentName}</div>
                    <div className="text-xs text-slate-500 font-mono">{userProfile.profileId}</div>
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded py-1 transition-colors"
            >
              Sign Out / Switch
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;