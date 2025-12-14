import { UserProfile, UserProgress } from '../types';

const PROFILE_KEY = 'agora_active_profile';

export const getActiveProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setActiveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const clearActiveProfile = () => {
  localStorage.removeItem(PROFILE_KEY);
};

export const getProgressKey = (profile: UserProfile) => {
  return `progress:${profile.agentName.toLowerCase()}:${profile.profileId}`;
};

export const saveProgress = (profile: UserProfile, progress: UserProgress) => {
  const key = getProgressKey(profile);
  localStorage.setItem(key, JSON.stringify(progress));
};

export const loadProgress = (profile: UserProfile): UserProgress | null => {
  const key = getProgressKey(profile);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

export const exportData = (profile: UserProfile, progress: UserProgress) => {
  const data = {
    profile,
    progress,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agora_backup_${profile.agentName}_${profile.profileId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateProfileId = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};