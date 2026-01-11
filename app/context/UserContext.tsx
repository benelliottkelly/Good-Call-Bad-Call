"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  userId: number;
  username: string;
  isAdmin: boolean;
} | null;

interface UserContextValue {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

interface UserProviderProps {
  children: ReactNode;
  initialUser: User; // from layout.tsx
}

export const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);

  useEffect(() => {
    const fetchUserFromCookie = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const user: User = await res.json();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch user from session", err);
      }
    };

    if (!currentUser) fetchUserFromCookie();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
