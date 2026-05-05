import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string) => void;
  signup: (fullName: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>({ email: 'admin@nitorinfotech.com', name: 'Admin User' });

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string) => {
    const mockUser = { email, name: email.split('@')[0] };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const signup = (fullName: string, email: string) => {
    const mockUser = { email, name: fullName };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
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
