import apiClient from './apiClient';

export interface UserProfile {
  fullName: string;
  email: string;
  salary?: number;
  savingsPercentage?: number;
  dob?: string;
  occupation?: string;
  isProfileComplete?: boolean;
}

const API_BASE_URL = '/user/profile';

export function checkProfileCompletion(profile: Partial<UserProfile>): boolean {
  if (profile.isProfileComplete === true) return true;
  const hasSalary = profile.salary != null && profile.salary > 0;
  const hasSavings = profile.savingsPercentage != null;
  const hasDob = Boolean(profile.dob && profile.dob.trim() !== '');
  const hasOccupation = Boolean(profile.occupation && profile.occupation.trim() !== '');
  return Boolean(hasSalary && hasSavings && hasDob && hasOccupation);
}

export async function getUserProfile(): Promise<UserProfile> {
  const local = localStorage.getItem('spendsense_user_profile');
  let localProfile: Partial<UserProfile> = {};
  if (local) {
    try {
      localProfile = JSON.parse(local);
    } catch (e) {
      // ignore
    }
  }

  const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  if (token) {
    try {
      const response = await apiClient.get(API_BASE_URL);
      const data = response.data || {};
      
      const merged: UserProfile = {
        fullName: data.fullName || localProfile.fullName || 'User',
        email: data.email || localProfile.email || '',
        salary: data.salary ?? localProfile.salary,
        savingsPercentage: data.savingsPercentage ?? localProfile.savingsPercentage,
        dob: data.dob || localProfile.dob,
        occupation: data.occupation || localProfile.occupation,
        isProfileComplete: data.isProfileComplete === true || localProfile.isProfileComplete === true
      };

      if (data.salary != null) {
        localStorage.setItem('monthlyBudget', String(data.salary));
      } else if (merged.salary != null) {
        localStorage.setItem('monthlyBudget', String(merged.salary));
      }

      if (data.savingsPercentage != null) {
        localStorage.setItem('savingsPercentage', String(data.savingsPercentage));
      } else if (merged.savingsPercentage != null) {
        localStorage.setItem('savingsPercentage', String(merged.savingsPercentage));
      }

      merged.isProfileComplete = localProfile.isProfileComplete === true || data.isProfileComplete === true || checkProfileCompletion(merged);
      localStorage.setItem('spendsense_user_profile', JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn("Backend user profile fetch failed, using local profile.");
    }
  }

  // Fallback for Demo mode or offline/unauthenticated users
  if (local) {
    try {
      const parsed: UserProfile = JSON.parse(local);
      if (parsed?.salary != null) {
        localStorage.setItem('monthlyBudget', String(parsed.salary));
      }
      if (parsed?.savingsPercentage != null) {
        localStorage.setItem('savingsPercentage', String(parsed.savingsPercentage));
      }
      parsed.isProfileComplete = parsed.isProfileComplete === true || checkProfileCompletion(parsed);
      return parsed;
    } catch (e) {
      // ignore
    }
  }

  const savedSalary = localStorage.getItem('monthlyBudget');
  const savedSavings = localStorage.getItem('savingsPercentage');
  const defaultProfile: UserProfile = {
    fullName: 'Guest User',
    email: 'guest@example.com',
    salary: savedSalary ? Number(savedSalary) : undefined,
    savingsPercentage: savedSavings ? Number(savedSavings) : undefined,
    isProfileComplete: false
  };

  defaultProfile.isProfileComplete = checkProfileCompletion(defaultProfile);
  return defaultProfile;
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  
  const local = localStorage.getItem('spendsense_user_profile');
  let localProfile: Partial<UserProfile> = {};
  if (local) {
    try {
      localProfile = JSON.parse(local);
    } catch (e) {
      // ignore
    }
  }

  const mergedPayload: UserProfile = {
    fullName: profile.fullName || localProfile.fullName || 'User',
    email: profile.email || localProfile.email || '',
    salary: profile.salary ?? localProfile.salary,
    savingsPercentage: profile.savingsPercentage ?? localProfile.savingsPercentage,
    dob: profile.dob || localProfile.dob,
    occupation: profile.occupation || localProfile.occupation,
    ...localProfile,
    ...profile,
    isProfileComplete: true
  };

  if (token) {
    try {
      const response = await apiClient.put(API_BASE_URL, mergedPayload);
      if (response.data && typeof response.data === 'object') {
        Object.assign(mergedPayload, response.data);
      }
    } catch (err) {
      console.warn("Backend user profile update failed, storing locally.");
    }
  }

  mergedPayload.isProfileComplete = true;

  // Always sync to local storage & monthlyBudget
  localStorage.setItem('spendsense_user_profile', JSON.stringify(mergedPayload));
  if (mergedPayload?.salary != null) {
    localStorage.setItem('monthlyBudget', String(mergedPayload.salary));
  }
  if (mergedPayload?.savingsPercentage != null) {
    localStorage.setItem('savingsPercentage', String(mergedPayload.savingsPercentage));
  }

  return mergedPayload;
}


