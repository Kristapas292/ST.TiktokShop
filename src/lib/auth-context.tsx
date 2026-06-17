"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, getToken, setToken, clearToken } from "./api";
import type { User, Tenant, AuthResponse } from "./types";

type AuthContextType = {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    tenantName: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<{ user: User; tenant: Tenant }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setTenant(data.tenant);
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  }

  async function register(input: {
    email: string;
    password: string;
    name: string;
    tenantName: string;
  }) {
    const data = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  }

  function logout() {
    clearToken();
    setUser(null);
    setTenant(null);
  }

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
