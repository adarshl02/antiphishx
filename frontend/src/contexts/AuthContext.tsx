import { ImageHistoryItem, TextHistoryItem } from '@/types/history';
import { createContext, useContext, ReactNode } from 'react';


export interface User {
  name: string;
  email: string;
  avatar: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
   userTextHistory: TextHistoryItem[];
  userImageHistory: ImageHistoryItem[];
  refreshHistory: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userTextHistory: [],
  userImageHistory: [],
  refreshHistory: async () => {},
  setIsLoading : async (loading: boolean) => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};