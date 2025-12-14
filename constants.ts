import { ModuleData, QuizQuestion, Badge } from './types';

export const MODULES: ModuleData[] = [
  { id: 'm0', title: 'Module 0: Education & Study Center', description: 'Company Overview, Products, Workflow, and Core Principles', duration: '45 min' },
  { id: 'm1', title: 'Module 1: Intro & Compliance', description: 'Roles, Ethics, and Independent Contractor Rules', duration: '15 min' },
  { id: 'm2', title: 'Module 2: Discovery Call Role-Play', description: 'AI-Simulated calls with Cautious, Desperate, and Rate Shopper clients', duration: '30 min' },
  { id: 'm3', title: 'Module 3: ICP & Lead Qualification', description: 'Identifying High-Quality Leads vs. Red Flags', duration: '20 min' },
  { id: 'm4', title: 'Module 4: Handoff SOP', description: 'Step-by-step handoff process to Closers', duration: '20 min' },
  { id: 'm5', title: 'Module 5: Commission & Finance', description: 'Understanding payments, schedules, and clawbacks', duration: '15 min' },
  { id: 'm6', title: 'Module 6: Lead Practice System', description: 'Mock lead entry simulation and AI grading', duration: 'Unlimited' },
  { id: 'm7', title: 'Module 7: Certification', description: 'Final verification and Certificate generation', duration: '5 min' },
];

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'scholar', name: 'Agora Scholar', description: 'Scored 90%+ on the Education Center Exam', icon: '🎓' },
  { id: 'compliance', name: 'Compliance Guardian', description: 'Perfect score on Compliance Quiz', icon: '🛡️' },
  { id: 'negotiator', name: 'Silver Tongue', description: 'Scored 90%+ in Role-Play scenarios', icon: '🤝' },
  { id: 'detective', name: 'Lead Detective', description: 'Perfect score on Lead Qualification Quiz', icon: '🕵️' },
  { id: 'finance', name: 'Money Minded', description: 'Mastered Commission & Finance rules', icon: '💰' },
  { id: 'certified', name: 'Agora Certified', description: 'Completed the full training program', icon: '🏆' }
];

export const M0_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    text: "Who founded Agora Enterprises?",
    type: 'multiple_choice',
    options: ["Elon Musk", "Darren Crawford", "Jeff Bezos"],
    correctAnswer: 1,
    explanation: "Agora was founded by Darren Crawford in 2022."
  },
  {
    id: 2,
    text: "True/False: Affiliates can guarantee loan approval if the client has good credit.",
    type: 'boolean',
    correctAnswer: false,
    explanation: "Never guarantee approval. All funding is subject to underwriting."
  },
  {
    id: 3,
    text: "Are affiliates allowed to collect upfront fees from clients?",
    type: 'boolean',
    correctAnswer: false,
    explanation: "No. We do not charge upfront fees. We are paid upon successful funding."
  },
  {
    id: 4,
    text: "Which financial product is revolving and requires interest payments only on what you use?",
    type: 'multiple_choice',
    options: ["Term Loan", "SBA Loan", "Line of Credit"],
    correctAnswer: 2,
    explanation: "A Line of Credit (LOC) is revolving capital."
  },
  {
    id: 5,
    text: "Scenario: A startup business owner needs $2k for personal rent. Is this a high-quality lead?",
    type: 'boolean',
    correctAnswer: false,
    explanation: "No. This is likely a personal loan request disguised as business, and too small/risky."
  },
  {
    id: 6,
    text: "Scenario: An owner is responsive, has been in business 3 years, and does $25k/mo revenue. Is this a high-quality lead?",
    type: 'boolean',
    correctAnswer: true,
    explanation: "Yes, this meets our core ICP criteria ($20k+ revenue, 2y+ TIB, Responsive)."
  },
  {
    id: 7,
    text: "Scenario: A client cannot provide revenue verification documents. What is the correct action?",
    type: 'multiple_choice',
    options: ["Submit anyway and hope", "Disqualify until information is available", "Make up numbers"],
    correctAnswer: 1,
    explanation: "We cannot proceed without verified revenue data."
  },
  {
    id: 8,
    text: "Scenario: A client has $15k revenue (below $20k target) and 1 year in business. Should you proceed to evaluate?",
    type: 'boolean',
    correctAnswer: false,
    explanation: "No. They do not meet the minimum $20k revenue or 2-year time in business requirement."
  },
  {
    id: 9,
    text: "What happens if a client defaults on their loan within 45 days of funding?",
    type: 'multiple_choice',
    options: ["Nothing", "You keep the commission", "Clawback (Return commission)"],
    correctAnswer: 2,
    explanation: "Early Payment Defaults (EPD) result in a full commission clawback."
  },
  {
    id: 10,
    text: "Scenario: A client pressures you for fast funding but clearly doesn't meet ICP. What do you do?",
    type: 'multiple_choice',
    options: ["Promise them you'll pull strings", "Explain the criteria politely and maintain professionalism", "Ignore them"],
    correctAnswer: 1,
    explanation: "Always maintain professionalism and explain the criteria/reality of the market."
  }
];

export const M1_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    text: "True/False: You may guarantee loan approval to a client if their revenue is strong.",
    type: 'boolean',
    correctAnswer: false,
    explanation: "You must never guarantee approval. Funding decisions are subject to underwriting."
  },
  {
    id: 2,
    text: "Which of the following is a major 'Red Flag' for a lead?",
    type: 'multiple_choice',
    options: [
      "Client has 24 months of consistent revenue",
      "Client is unresponsive to basic questions",
      "Client has a clear purpose for funds"
    ],
    correctAnswer: 1, // Index of 'b'
    explanation: "An unresponsive owner usually indicates lack of seriousness or hidden issues."
  },
  {
    id: 3,
    text: "Scenario: A client pressures you for a rate guarantee before sending documents. What do you do?",
    type: 'multiple_choice',
    options: [
      "Give them a ballpark estimate just to get the deal moving",
      "Tell them you can't help them",
      "Educate them on the process and ask qualifying questions to build value first"
    ],
    correctAnswer: 2,
    explanation: "Always pivot back to education and qualification. Rates depend on risk profile, which requires data."
  }
];

export const M3_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    text: "What is the minimum monthly revenue for our Ideal Customer Profile (ICP)?",
    type: 'multiple_choice',
    options: ["$10,000", "$20,000", "$50,000"],
    correctAnswer: 1,
    explanation: "We target businesses with at least $20,000/mo gross revenue."
  },
  {
    id: 2,
    text: "Scenario: A trucking company with 1 truck, 18 months in business, doing $40k/mo. Qualified?",
    type: 'multiple_choice',
    options: ["Yes, revenue is high", "No, time in business is under 2 years", "No, trucking is restricted"],
    correctAnswer: 1,
    explanation: "Minimum time in business is 2 years. High revenue does not offset the risk of younger businesses."
  }
];

export const M5_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    text: "What is the commission split for your first 20 funded clients?",
    type: 'multiple_choice',
    options: ["20% Net Revenue", "50% Net Revenue", "10% Loan Amount"],
    correctAnswer: 1,
    explanation: "New affiliates start at 50% of the Net Revenue generated from the deal."
  },
  {
    id: 2,
    text: "If a client defaults within 45 days, what is your obligation?",
    type: 'multiple_choice',
    options: ["None, the deal is done", "Return 50% of commission", "Return full commission (Clawback)"],
    correctAnswer: 2,
    explanation: "Early Payment Default (EPD) triggers a full commission clawback."
  }
];

export const ROLEPLAY_SCENARIOS = [
  {
    id: 'cautious',
    title: 'The Cautious Owner',
    description: 'Skeptical, has been burned by brokers before. Needs trust building.',
    systemPrompt: `You are James, the owner of a construction company. You are skeptical about online lenders because you were charged high fees last year. You are talking to a funding affiliate.
    Your stats: 3 years in business, $35k revenue, 700 credit.
    Be short in your responses. Challenge the affiliate on "hidden fees".
    Only agree to proceed if they clearly explain they are transparent and offer no upfront cost options.
    If they are pushy, hang up (say "I'm not interested").`
  },
  {
    id: 'desperate',
    title: 'The Desperate Owner',
    description: 'Needs funds urgently for payroll. High risk of sounding too needy.',
    systemPrompt: `You are Sarah, a retail store owner. You need $20k by Friday for payroll or you are in trouble.
    Your stats: 18 months in business (fail TIB), $15k revenue (fail Rev), 600 credit (fail credit).
    You are frantic and pushy. You want money NOW.
    The affiliate needs to DQ you politely based on TIB or Revenue.
    If they promise a guarantee, say "Great! Send the contract!" (This is a trap/fail for compliance).`
  },
  {
    id: 'shopper',
    title: 'The Rate Shopper',
    description: 'Only cares about the interest rate. Will not give docs without a quote.',
    systemPrompt: `You are Mike, a logistics fleet owner. You have great credit (740) and good revenue ($50k).
    You refuse to send bank statements until you know the "exact rate".
    The affiliate must educate you that rates depend on underwriting.
    If they give you a fake rate, accuse them of lying later.
    If they handle the objection well (explain process), agree to send statements.`
  }
];