import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Extrair informações do token JWT
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: tokenData.email,
          email: tokenData.email,
          nome: '',
          role: tokenData.perfil
        });
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await userService.login(email, senha);
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token);
      // Extrair informações do token JWT
      const tokenData = JSON.parse(atob(response.access_token.split('.')[1]));
      setUser({
        id: tokenData.email,
        email: tokenData.email,
        nome: '',
        role: tokenData.perfil
      });
    } else {
      throw new Error('Token não recebido');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 