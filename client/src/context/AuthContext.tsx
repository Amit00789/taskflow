import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  logoutUser,
  refreshAccessToken,
} from "../api/auth.api";

import {
  setAccessToken as setAxiosAccessToken,
} from "../api/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean;
  login: (
    accessToken: string,
    user: User
  ) => void;
  logout: () => void;
}


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  function login(
    token: string,
    user: User
  ) {
    setAccessToken(token);
    setAxiosAccessToken(token);

    setUser(user);
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      setAccessToken(null);
      setAxiosAccessToken(null);
      setUser(null);
    }
  }

  const hasInitialized = useRef(false);


  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    async function restoreSession() {
      console.log("RESTORING SESSION...");

      try {
        const result = await refreshAccessToken();

        console.log("REFRESH SUCCESS:", result);

        const token = result.data.accessToken;
        const user = result.data.user;

        setAccessToken(token);
        setAxiosAccessToken(token);
        setUser(user);
      } catch (error) {
        console.log("NO ACTIVE SESSION");

        setAccessToken(null);
        setAxiosAccessToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}