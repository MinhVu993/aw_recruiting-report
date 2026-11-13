"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AppRole = "admin" | "review" | "user";

export interface UserSession {
  empno: string;
  name: string;
  username?: string;
  dept: string;
  high_dept?: string;
  location?: string;
  factory: string;
  factory_code?: any;
  allowedFactories: string[];
  role: AppRole;
  token?: string;
  userCompanies?: string[];
}

interface SessionContextType {
  user: UserSession;
  selectedFactory: string;
  setSelectedFactory: (factory: string) => void;
  isLoading: boolean;
  setLocale: (locale: string) => void;
  currentLocale: string;
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  // Role & permission helpers
  isAdmin: boolean;
  isReviewer: boolean;
  isUserOnly: boolean;
}

const defaultUser: UserSession = {
  empno: "",
  name: "",
  dept: "",
  factory: "aw",
  allowedFactories: ["aw"],
  role: "user",
};

const SessionContext = createContext<SessionContextType>({
  user: defaultUser,
  selectedFactory: "aw",
  setSelectedFactory: () => {},
  isLoading: false,
  setLocale: () => {},
  currentLocale: "vi",
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  isAdmin: false,
  isReviewer: false,
  isUserOnly: true,
});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(defaultUser);
  const [selectedFactory, setSelectedFactory] = useState<string>("aw");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentLocale, setCurrentLocale] = useState<string>("vi");
  const [theme, setThemeState] = useState<"dark" | "light">("light");

  const applyTheme = (t: "dark" | "light" = "light") => {
    setThemeState("light");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", "light");
      const root = document.documentElement;
      root.style.colorScheme = "light";
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  const toggleTheme = () => {
    applyTheme("light");
  };

  // Parse role strictly according to GMO SSO app rules: admin, review (or reviewer), user
  const parseRole = (appRoles: any): AppRole => {
    if (!appRoles) return "user";
    let roleStr: any = null;
    if (typeof appRoles === "string") {
      const trimmed = appRoles.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            const roleItem = parsed.find(
              (app: any) => app && (app.app === "aw-recruiting-report" || app.app === "recruiting-report")
            );
            roleStr = roleItem ? roleItem.role : null;
          } else if (typeof parsed === "object" && parsed !== null) {
            roleStr = parsed["aw-recruiting-report"] || parsed["recruiting-report"] || parsed.role || null;
          }
        } catch {
          roleStr = appRoles;
        }
      } else {
        roleStr = appRoles;
      }
    } else if (Array.isArray(appRoles)) {
      const roleItem = appRoles.find(
        (app: any) => app && (app.app === "aw-recruiting-report" || app.app === "recruiting-report")
      );
      roleStr = roleItem ? roleItem.role : null;
    } else if (typeof appRoles === "object" && appRoles !== null) {
      roleStr = appRoles["aw-recruiting-report"] || appRoles["recruiting-report"] || appRoles.role || null;
    }

    if (!roleStr) return "user";
    const normalized = String(roleStr).toLowerCase().trim();
    if (normalized === "admin") return "admin";
    if (normalized === "review" || normalized === "reviewer") return "review";
    return "user";
  };

  // Parse factory_code array and fallback to primary factory (aw)
  const parseAllowedFactories = (factoryCode: any, rawFactory?: string): string[] => {
    let rawList: any[] = [];
    if (typeof factoryCode === "string") {
      const trimmed = factoryCode.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) rawList = parsed;
          else if (parsed) rawList = [parsed];
        } catch {
          rawList = [factoryCode];
        }
      } else if (trimmed) {
        rawList = [trimmed];
      }
    } else if (Array.isArray(factoryCode)) {
      rawList = factoryCode;
    } else if (factoryCode) {
      rawList = [factoryCode];
    }

    if (rawList.length === 0 && rawFactory) {
      rawList = [rawFactory];
    }

    const validSet = new Set<string>();
    rawList.forEach((item) => {
      if (!item) return;
      const s = String(item).toLowerCase().trim();
      validSet.add(s);
    });

    if (validSet.size === 0) validSet.add("aw");
    return Array.from(validSet);
  };

  const parseFactory = (factoryCode: any, rawFactory?: string): string => {
    const allowed = parseAllowedFactories(factoryCode, rawFactory);
    return allowed[0] || "aw";
  };

  // Check app permission via global-user API (App ID 38 = recruiting-report)
  const checkAppAccess = async (empno: string): Promise<string[] | null> => {
    if (!empno) return null;
    try {
      const res = await fetch("https://gmo021.cansportsvg.com/api/global-user/checkAppAccess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empno, app_id: 38 }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          if (Array.isArray(json.data) && json.data.length === 0) {
            alert(
              "You do not have permission to access this application.\n您无权访问此应用程序。\nBạn không có quyền truy cập ứng dụng này."
            );
            if (typeof window !== "undefined") {
              window.location.href = "http://gmo021.cansportsvg.com";
            }
            return [];
          }
          const companies = (json.data || [])
            .filter((item: any) => item.company)
            .map((item: any) => item.company.code);
          return companies;
        }
      }
    } catch (e) {
      console.warn("[checkAppAccess] Error:", e);
    }
    return null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Kiểm tra sessionToken từ URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken =
      urlParams.get("session-token") ||
      urlParams.get("sessionToken") ||
      urlParams.get("token");

    if (urlToken) {
      localStorage.setItem("session-token", urlToken);
      urlParams.delete("session-token");
      urlParams.delete("sessionToken");
      urlParams.delete("token");
      const newUrl =
        window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }

    // 2. Tải ngôn ngữ và cố định giao diện sáng (Light mode)
    applyTheme("light");

    const savedLocale = localStorage.getItem("app-locale");
    if (savedLocale === "vi" || savedLocale === "en" || savedLocale === "cn") {
      setCurrentLocale(savedLocale);
    }

    let savedFactory = localStorage.getItem("selected-factory");
    if (!savedFactory) {
      savedFactory = "aw";
      localStorage.setItem("selected-factory", "aw");
    }
    if (savedFactory) {
      setSelectedFactory(savedFactory);
    }

    // 3. Lấy thông tin phiên làm việc từ session storage của app cũ nếu có (vue-session-key)
    const loadSessionData = async () => {
      try {
        let legacySession: any = null;
        try {
          const rawVueSession =
            window.sessionStorage.getItem("vue-session-key") ||
            window.localStorage.getItem("vue-session-key");
          if (rawVueSession) {
            const parsedVueSession = JSON.parse(rawVueSession);
            legacySession =
              parsedVueSession ? (parsedVueSession["aw-recruiting-report"] || parsedVueSession["recruiting-report"]) : null;
          }
        } catch {
          legacySession = null;
        }

        // Hoặc kiểm tra lưu trực tiếp trong localStorage
        if (!legacySession) {
          try {
            const rawDirect =
              localStorage.getItem("aw-recruiting-report-session") ||
              localStorage.getItem("recruiting-report-session");
            if (rawDirect) {
              legacySession = JSON.parse(rawDirect);
            }
          } catch {}
        }

        if (legacySession && legacySession.name) {
          const parsedRole = parseRole(legacySession.app_roles || legacySession.role);
          const allowedFact = parseAllowedFactories(legacySession.factory_code, legacySession.factory);
          const parsedFact = parseFactory(legacySession.factory_code, legacySession.factory);
          const sessionUser: UserSession = {
            empno: legacySession.empno || legacySession.username || "",
            name: legacySession.name || legacySession.username || "",
            username: legacySession.username || "",
            dept: legacySession.dept || "",
            high_dept: legacySession.high_dept || legacySession.hight_dept || "",
            location: legacySession.location || "",
            factory: parsedFact,
            factory_code: legacySession.factory_code,
            allowedFactories: allowedFact,
            role: parsedRole,
            token: localStorage.getItem("session-token") || undefined,
          };
          setUser(sessionUser);
          if (parsedFact && !savedFactory) {
            setSelectedFactory(parsedFact);
          }

          if (sessionUser.empno) {
            checkAppAccess(sessionUser.empno);
          }
        }

        // 4. Nếu có token, gọi API global-user để cập nhật thông tin mới nhất giống app cũ
        const token = localStorage.getItem("session-token");
        if (token) {
          const res = await fetch("https://gmo021.cansportsvg.com/api/global-user/getUserDataBySession", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              session_token: token,
              app: "aw-recruiting-report",
            }),
          });

          if (res.ok) {
            const result = await res.json();
            if (result.status === "success" && result.data) {
              const apiData = result.data;
              const parsedRole = parseRole(apiData.app_roles);
              const allowedFact = parseAllowedFactories(apiData.factory_code, apiData.factory);
              const parsedFact = parseFactory(apiData.factory_code, apiData.factory);
              const activeUser: UserSession = {
                empno: apiData.empno || apiData.username || "",
                name: apiData.name || apiData.username || "",
                username: apiData.username || "",
                dept: apiData.dept || "",
                high_dept: apiData.high_dept || apiData.hight_dept || "",
                location: apiData.location || "",
                factory: parsedFact,
                factory_code: apiData.factory_code,
                allowedFactories: allowedFact,
                role: parsedRole,
                token: token,
              };
              setUser(activeUser);

              // Lưu lại vào localStorage để đồng bộ phiên
              const sessionPayload = JSON.stringify({
                ...apiData,
                app_roles: parsedRole,
                factory: parsedFact,
                allowedFactories: allowedFact,
              });
              localStorage.setItem("aw-recruiting-report-session", sessionPayload);
              localStorage.setItem("recruiting-report-session", sessionPayload);

              if (parsedFact && !savedFactory) {
                setSelectedFactory(parsedFact);
              }

              if (activeUser.empno) {
                const companies = await checkAppAccess(activeUser.empno);
                if (companies) {
                  setUser((prev) => ({ ...prev, userCompanies: companies }));
                }
              }
            }
          }
        } else if (process.env.NODE_ENV === "development" && (!legacySession || !legacySession.name)) {
          // Local dev bypass gracefully: role "admin" if no SSO auth token in dev
          const devUser: UserSession = {
            empno: "DEV_ADMIN",
            name: "Dev Administrator",
            username: "admin",
            dept: "IT",
            factory: "aw",
            allowedFactories: ["aw"],
            role: "admin",
          };
          setUser(devUser);
        }
      } catch (err) {
        console.warn("[SessionContext] Error loading session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, []);

  const handleSetFactory = (factory: string) => {
    setSelectedFactory(factory);
    if (typeof window !== "undefined") {
      localStorage.setItem("selected-factory", factory);
    }
  };

  const handleSetLocale = (locale: string) => {
    setCurrentLocale(locale);
    if (typeof window !== "undefined") {
      localStorage.setItem("app-locale", locale);
    }
  };

  const isAdmin = user.role === "admin";
  const isReviewer = user.role === "review";
  const isUserOnly = user.role === "user";

  return (
    <SessionContext.Provider
      value={{
        user,
        selectedFactory,
        setSelectedFactory: handleSetFactory,
        isLoading,
        setLocale: handleSetLocale,
        currentLocale,
        theme,
        toggleTheme,
        setTheme: applyTheme,
        isAdmin,
        isReviewer,
        isUserOnly,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

