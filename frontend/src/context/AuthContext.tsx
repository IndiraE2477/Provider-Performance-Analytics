import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppSelector, useAppDispatch } from "../store";
import {
  setCredentials,
  logout as logoutAction,
  selectAuth,
} from "../store/slices/authSlice";

const SESSION_TIMEOUT_MS = 15 * 60_000; // 15 minutes of inactivity before warning
const COUNTDOWN_SECONDS = 30; // 30 second countdown on the warning popup

interface AuthContextType {
  token: string | null;
  username: string | null;
  fullName: string | null;
  role: string | null;
  providerId: number | null;
  isAuthenticated: boolean;
  login: (
    token: string,
    username: string,
    fullName: string,
    role: string,
    providerId: number | null,
  ) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);

  const login = useCallback(
    (
      token: string,
      username: string,
      fullName: string,
      role: string,
      providerId: number | null,
    ) => {
      dispatch(setCredentials({ token, username, fullName, role, providerId }));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const hasRole = useCallback(
    (roles: string[]) => {
      return authState.role ? roles.includes(authState.role) : false;
    },
    [authState.role],
  );

  const value = useMemo(
    () => ({
      token: authState.token,
      username: authState.username,
      fullName: authState.fullName,
      role: authState.role,
      providerId: authState.providerId,
      isAuthenticated: authState.isAuthenticated,
      login,
      logout,
      hasRole,
    }),
    [authState, login, logout, hasRole],
  );

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const countdownRef = useRef(COUNTDOWN_SECONDS);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const showTimeoutModalRef = useRef(false);
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    countdownRef.current = COUNTDOWN_SECONDS;
    setCountdown(COUNTDOWN_SECONDS);
    showTimeoutModalRef.current = true;
    setShowTimeoutModal(true);

    countdownIntervalRef.current = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
        showTimeoutModalRef.current = false;
        setShowTimeoutModal(false);
        logoutRef.current();
      }
    }, 1000);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (showTimeoutModalRef.current) return;
    clearAllTimers();
    inactivityTimerRef.current = setTimeout(() => {
      startCountdown();
    }, SESSION_TIMEOUT_MS);
  }, [clearAllTimers, startCountdown]);

  const handleStayLoggedIn = useCallback(() => {
    clearAllTimers();
    showTimeoutModalRef.current = false;
    setShowTimeoutModal(false);
    countdownRef.current = COUNTDOWN_SECONDS;
    setCountdown(COUNTDOWN_SECONDS);
    inactivityTimerRef.current = setTimeout(() => {
      startCountdown();
    }, SESSION_TIMEOUT_MS);
  }, [clearAllTimers, startCountdown]);

  const handleTimeoutLogout = useCallback(() => {
    clearAllTimers();
    showTimeoutModalRef.current = false;
    setShowTimeoutModal(false);
    logout();
  }, [clearAllTimers, logout]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      clearAllTimers();
      showTimeoutModalRef.current = false;
      setShowTimeoutModal(false);
      return;
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "mousedown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer),
    );
    resetInactivityTimer();

    return () => {
      clearAllTimers();
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer),
      );
    };
  }, [authState.isAuthenticated, resetInactivityTimer, clearAllTimers]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showTimeoutModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div
            className="modal-content"
            style={{ maxWidth: 400, textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
            <h3 style={{ margin: "0 0 8px" }}>Session Timeout</h3>
            <p style={{ color: "#64748b", marginBottom: 8 }}>
              Your session is about to expire due to inactivity.
            </p>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: countdown <= 5 ? "#ef4444" : "#2563eb",
                margin: "16px 0",
                fontVariantNumeric: "tabular-nums",
                transition: "color 0.3s",
              }}
            >
              {countdown}s
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
              You will be logged out automatically.
            </p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={handleTimeoutLogout}>
                Logout
              </button>
              <button className="btn btn-primary" onClick={handleStayLoggedIn}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
