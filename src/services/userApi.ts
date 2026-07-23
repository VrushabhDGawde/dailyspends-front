import apiClient from './apiClient';

export interface UserProfile {
  fullName: string;
  email: string;
  salary?: number;
  savingsPercentage?: number;
}

const API_BASE_URL = '/user/profile';

export async function getUserProfile(): Promise<UserProfile> {
  const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  if (token) {
    try {
      const response = await apiClient.get(API_BASE_URL);
      if (response.data?.salary != null) {
        localStorage.setItem('monthlyBudget', String(response.data.salary));
      }
      if (response.data?.savingsPercentage != null) {
        localStorage.setItem('savingsPercentage', String(response.data.savingsPercentage));
      }
      return response.data;
    } catch (err) {
      console.warn("Backend user profile fetch failed, using local profile.");
    }
  }

  // Fallback for Demo mode or offline/unauthenticated users
  const local = localStorage.getItem('spendsense_user_profile');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed?.salary != null) {
        localStorage.setItem('monthlyBudget', String(parsed.salary));
      }
      if (parsed?.savingsPercentage != null) {
        localStorage.setItem('savingsPercentage', String(parsed.savingsPercentage));
      }
      return parsed;
    } catch (e) {
      // ignore
    }
  }

  const savedSalary = localStorage.getItem('monthlyBudget');
  const savedSavings = localStorage.getItem('savingsPercentage');
  return {
    fullName: 'Guest User',
    email: 'guest@example.com',
    salary: savedSalary ? Number(savedSalary) : 30000,
    savingsPercentage: savedSavings ? Number(savedSavings) : 0
  };
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  let resultProfile: UserProfile | null = null;

  if (token) {
    try {
      const response = await apiClient.put(API_BASE_URL, profile);
      resultProfile = response.data;
    } catch (err) {
      console.warn("Backend user profile update failed, storing locally.");
    }
  }

  if (!resultProfile) {
    const current = await getUserProfile();
    resultProfile = { ...current, ...profile };
  }

  // Always sync to local storage & monthlyBudget
  localStorage.setItem('spendsense_user_profile', JSON.stringify(resultProfile));
  if (resultProfile?.salary != null) {
    localStorage.setItem('monthlyBudget', String(resultProfile.salary));
  }
  if (resultProfile?.savingsPercentage != null) {
    localStorage.setItem('savingsPercentage', String(resultProfile.savingsPercentage));
  }

  return resultProfile;
}

