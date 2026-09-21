import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = { id: number; email: string; fullName: string };
type AuthState = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthState | null>(null);

let accessTokenMemory: string | null = null;
export const getAccessToken = () => accessTokenMemory;

const API = "http://localhost:3000/api/v1/users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (t: string | null) => {
    accessTokenMemory = t;
  };

  // On mount, try refreshing the access token using the refresh token cookie
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const { accessToken } = await res.json();
          setToken(accessToken);
          await loadProfile(accessToken);
        }
      } catch {
        console.log("No valid refresh token found, user is not logged in");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadProfile = async (token: string) => {
    const res = await fetch(`${API}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { user } = await res.json();
      setUser(user);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Login failed");

    setToken(body.accessToken);
    setUser(body.user);
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refreshAccess = async (): Promise<string | null> => {
    const res = await fetch(`${API}/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      setToken(null);
      setUser(null);
      return null;
    }
    const { accessToken } = await res.json();
    setToken(accessToken);
    return accessToken;
  };

  //Authenticated fetch - auto refresh on 401/403
  const authFetch = async (
    input: RequestInfo, // URL or Request object
    init: RequestInit = {} // Optional init object
  ): Promise<Response> => {
    const doCall = (token: string | null) =>
      fetch(input, {
        ...init,
        credentials: "include",
        headers: {
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

    let res = await doCall(getAccessToken());

    // Access token expired or invalid
    if (res.status === 401 || res.status === 403) {
      const newToken = await refreshAccess();
      if (!newToken) {
        // Refresh failed
        window.location.href = "/login";
        return res;
      }
      res = await doCall(newToken);
    }

    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenMemory,
        loading,
        login,
        register,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
