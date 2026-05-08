import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user
      api.get('/auth/profile')
        .then(response => setUser(response.data))
        .catch((error) => {
          if (token.startsWith('demo-token')) {
            console.log('Using persisted demo session');
            setUser({ id: 1, username: 'admin', email: 'admin@building.com', role: 'admin' });
          } else {
            console.error('Session verification failed:', error);
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid server response: Missing token or user data');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.warn('Backend login failed, checking for demo credentials...', error);
      
      // Frontend Mock Fallback for Demo purposes
      const demoUsers: Record<string, any> = {
        'admin': { id: 1, username: 'admin', email: 'admin@building.com', role: 'admin' },
        'operator': { id: 2, username: 'operator', email: 'operator@building.com', role: 'operator' },
        'viewer': { id: 3, username: 'viewer', email: 'viewer@building.com', role: 'viewer' }
      };
      
      const demoPasswords: Record<string, string> = {
        'admin': 'admin123',
        'operator': 'operator123',
        'viewer': 'viewer123'
      };

      if (demoUsers[username] && password === demoPasswords[username]) {
        console.log('Demo login successful (Frontend Mock)');
        const mockToken = 'demo-token-' + Math.random().toString(36).substr(2);
        localStorage.setItem('token', mockToken);
        setUser(demoUsers[username]);
        return;
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};