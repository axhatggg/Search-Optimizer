import { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email, password) => {
    // Simulate login
    setLoading(true);
    setTimeout(() => {
      setUser({ uid: 'demo-user', email });
      setLoading(false);
      toast({
        title: "Success",
        description: "You have been logged in successfully!",
      });
    }, 1000);
  };

  const logout = async () => {
    setUser(null);
    toast({
      title: "Success",
      description: "You have been logged out successfully!",
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 