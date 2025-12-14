export enum ModuleStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export type ModuleId = 'dashboard' | 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'admin';

export interface ModuleData {
  id: ModuleId;
  title: string;
  description: string;
  duration: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options?: string[]; // If multiple choice
  type: 'boolean' | 'multiple_choice' | 'scenario';
  correctAnswer: string | number | boolean;
  explanation: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserProfile {
  agentName: string;
  profileId: string;
  createdAt: number;
}

export interface UserProgress {
  modules: Record<ModuleId, {
    status: ModuleStatus;
    score?: number; // 0-100
    attempts?: number;
    answers?: Record<number, any>;
  }>;
  certificationId?: string;
  totalPoints: number;
  badges: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LeadSubmission {
  affiliateName: string;
  clientName: string;
  businessTime: string;
  revenue: string;
  creditScore: string;
  industry: string;
  purpose: string;
  urgency: string;
  hasBankStatements: boolean;
  icpMet: boolean;
}