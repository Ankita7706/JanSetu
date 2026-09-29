import type { User, Role } from '../types';
import { MOCK_USERS } from '../data/mockData';

const SESSION_KEY = 'ngb_session';
const PROFILE_UPDATED_EVENT = 'jansetu_user_profile_updated';

type AuthListener = (user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

export const authService = {
  login(email: string, _password: string, role: Role): User | null {
    const user = MOCK_USERS.find(
      u => u.email === email && (u.role === role || (role === 'government' && u.role === 'official') || (role === 'official' && u.role === 'government'))
    );
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      this.notifyListeners(user);
      return user;
    }
    return null;
  },

  saveUser(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.notifyListeners(user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: user }));
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.notifyListeners(null);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      // Default to official user if in government session
      return MOCK_USERS[1];
    }
    try {
      const parsed = JSON.parse(raw) as User;
      // Merge missing official fields with defaults if official
      if (parsed.role === 'official' || parsed.role === 'government') {
        const defaultOfficial = MOCK_USERS[1];
        return {
          ...defaultOfficial,
          ...parsed,
        };
      }
      return parsed;
    } catch {
      return MOCK_USERS[1];
    }
  },

  subscribe(listener: AuthListener): () => void {
    authListeners.add(listener);
    listener(this.getCurrentUser());
    return () => {
      authListeners.delete(listener);
    };
  },

  notifyListeners(user: User | null): void {
    authListeners.forEach(l => {
      try {
        l(user);
      } catch (e) {
        console.error('Error notifying auth listener:', e);
      }
    });
  },

  isCitizen(user?: User | null): boolean {
    const u = user !== undefined ? user : this.getCurrentUser();
    return u?.role === 'citizen';
  },

  isGovernment(user?: User | null): boolean {
    const u = user !== undefined ? user : this.getCurrentUser();
    return u?.role === 'government' || u?.role === 'official';
  },
};
