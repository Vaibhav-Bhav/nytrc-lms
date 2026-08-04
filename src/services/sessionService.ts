import { DeviceSession, SessionApiResponse } from "../data/types";

const MAX_ALLOWED_DEVICES = 2;
const STORAGE_KEYS = {
  SESSIONS: "lms_active_device_sessions",
  CURRENT_ID: "lms_current_device_id",
};

// Initial seed sessions for testing and demo flow
const INITIAL_SEED_SESSIONS: DeviceSession[] = [
  {
    id: "dev_win_laptop_01",
    device_name: "Windows Laptop",
    browser: "Chrome",
    os: "Windows 11",
    login_time: "Today, 10:00 AM",
    last_active: "5 mins ago",
    is_current_device: true,
    status: "active",
    type: "desktop",
    location: "Mumbai, Maharashtra",
    name: "Windows Laptop",
    current: true,
    lastActive: "5 mins ago",
  },
  {
    id: "dev_android_mob_02",
    device_name: "Android Mobile",
    browser: "Chrome",
    os: "Android 14",
    login_time: "Today, 08:30 AM",
    last_active: "15 mins ago",
    is_current_device: false,
    status: "active",
    type: "mobile",
    location: "Mumbai, Maharashtra",
    name: "Android Mobile",
    current: false,
    lastActive: "15 mins ago",
  },
];

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadSessionsFromStorage(): DeviceSession[] {
  if (typeof window === "undefined") return [...INITIAL_SEED_SESSIONS];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load device sessions from storage:", e);
  }
  return [...INITIAL_SEED_SESSIONS];
}

function saveSessionsToStorage(sessions: DeviceSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save device sessions to storage:", e);
  }
}

function getCurrentDeviceIdFromStorage(): string {
  if (typeof window === "undefined") return "dev_win_laptop_01";
  return localStorage.getItem(STORAGE_KEYS.CURRENT_ID) || "dev_win_laptop_01";
}

function setCurrentDeviceIdInStorage(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_ID, id);
}

export function detectDeviceDetails(): { device_name: string; browser: string; os: string; type: "desktop" | "mobile" | "tablet" } {
  if (typeof window === "undefined" || !navigator) {
    return { device_name: "Windows Laptop", browser: "Chrome", os: "Windows 11", type: "desktop" };
  }
  const ua = navigator.userAgent;
  let os = "Windows 11";
  let browser = "Chrome";
  let type: "desktop" | "mobile" | "tablet" = "desktop";

  if (/iPad|tablet/i.test(ua)) {
    type = "tablet";
    os = "iPadOS";
  } else if (/iPhone|Android/i.test(ua)) {
    type = "mobile";
    os = /iPhone/i.test(ua) ? "iOS 17" : "Android 14";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS Sequoia";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  if (/Edg/i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/Chrome/i.test(ua)) {
    browser = "Chrome";
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/Firefox/i.test(ua)) {
    browser = "Firefox";
  }

  let device_name = `${os} ${type === "desktop" ? "PC" : type === "mobile" ? "Mobile" : "Tablet"}`;
  if (os.includes("Windows")) device_name = "Windows Laptop";
  else if (os.includes("macOS")) device_name = "MacBook Pro";
  else if (os.includes("iOS")) device_name = "iPhone 15";
  else if (os.includes("Android")) device_name = "Android Mobile";

  return { device_name, browser, os, type };
}

export const sessionService = {
  /**
   * GET /api/auth/sessions
   * Returns list of all active device sessions for current account
   */
  async getSessions(): Promise<SessionApiResponse> {
    await delay(150);
    const currentId = getCurrentDeviceIdFromStorage();
    const stored = loadSessionsFromStorage();

    const formattedSessions = stored.map((s) => ({
      ...s,
      is_current_device: s.id === currentId,
      current: s.id === currentId,
      name: s.device_name || s.name || "Device",
      lastActive: s.last_active || s.lastActive || "Just now",
    }));

    const activeCount = formattedSessions.filter((s) => s.status === "active").length;

    return {
      max_devices: MAX_ALLOWED_DEVICES,
      active_devices: activeCount,
      devices: formattedSessions,
    };
  },

  /**
   * GET /api/auth/current-session
   * Returns the current device session details
   */
  async getCurrentSession(): Promise<DeviceSession | null> {
    await delay(100);
    const currentId = getCurrentDeviceIdFromStorage();
    const sessions = loadSessionsFromStorage();
    const current = sessions.find((s) => s.id === currentId && s.status === "active");
    if (!current) return null;
    return {
      ...current,
      is_current_device: true,
      current: true,
    };
  },

  /**
   * POST /api/auth/login
   * Validates active sessions count (Max 2 allowed).
   * If limit is reached and attempt is from 3rd device -> blocks login and returns error.
   */
  async login(
    email: string,
    password: string,
    simulatedDevicePreset?: { device_name: string; browser: string; os: string; type: "desktop" | "mobile" | "tablet" }
  ): Promise<{
    success: boolean;
    max_limit_reached?: boolean;
    message?: string;
    session?: DeviceSession;
    response?: SessionApiResponse;
  }> {
    await delay(300);
    const sessions = loadSessionsFromStorage();
    const activeSessions = sessions.filter((s) => s.status === "active");
    const currentId = getCurrentDeviceIdFromStorage();

    // Check if current device is already among active sessions
    const existingCurrentSession = activeSessions.find((s) => s.id === currentId);

    // If device limit reached (>= 2) AND this request is from a new/unregistered 3rd device
    if (activeSessions.length >= MAX_ALLOWED_DEVICES && !existingCurrentSession) {
      return {
        success: false,
        max_limit_reached: true,
        message: "Maximum Active Device Limit Reached. You can only use the LMS on two active devices at a time. Please logout from one of your existing devices to continue.",
        response: {
          max_devices: MAX_ALLOWED_DEVICES,
          active_devices: activeSessions.length,
          devices: activeSessions.map((s) => ({ ...s, is_current_device: s.id === currentId })),
        },
      };
    }

    // If current device already active, refresh its timestamp
    if (existingCurrentSession) {
      existingCurrentSession.last_active = "Just now";
      existingCurrentSession.lastActive = "Just now";
      saveSessionsToStorage(sessions);
      return {
        success: true,
        session: existingCurrentSession,
        response: {
          max_devices: MAX_ALLOWED_DEVICES,
          active_devices: activeSessions.length,
          devices: sessions.map((s) => ({ ...s, is_current_device: s.id === currentId })),
        },
      };
    }

    // Otherwise, create a new active session for this device
    const detected = simulatedDevicePreset || detectDeviceDetails();
    const newSessionId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newSession: DeviceSession = {
      id: newSessionId,
      device_name: detected.device_name,
      browser: detected.browser,
      os: detected.os,
      login_time: `Today, ${nowTime}`,
      last_active: "Just now",
      is_current_device: true,
      status: "active",
      type: detected.type,
      location: "Mumbai, Maharashtra",
      name: detected.device_name,
      current: true,
      lastActive: "Just now",
    };

    sessions.push(newSession);
    setCurrentDeviceIdInStorage(newSessionId);
    saveSessionsToStorage(sessions);

    const updatedActive = sessions.filter((s) => s.status === "active");

    return {
      success: true,
      session: newSession,
      response: {
        max_devices: MAX_ALLOWED_DEVICES,
        active_devices: updatedActive.length,
        devices: sessions.map((s) => ({ ...s, is_current_device: s.id === newSessionId })),
      },
    };
  },

  /**
   * DELETE /api/auth/session/:id
   * Revokes/logs out a specific device session by ID
   */
  async revokeSession(sessionId: string): Promise<SessionApiResponse> {
    await delay(250);
    let sessions = loadSessionsFromStorage();
    sessions = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(sessions);

    const currentId = getCurrentDeviceIdFromStorage();
    const activeSessions = sessions.filter((s) => s.status === "active");

    return {
      max_devices: MAX_ALLOWED_DEVICES,
      active_devices: activeSessions.length,
      devices: sessions.map((s) => ({ ...s, is_current_device: s.id === currentId })),
    };
  },

  /**
   * POST /api/auth/logout
   * Logs out current device session
   */
  async logoutCurrentSession(): Promise<void> {
    await delay(200);
    const currentId = getCurrentDeviceIdFromStorage();
    let sessions = loadSessionsFromStorage();
    sessions = sessions.filter((s) => s.id !== currentId);
    saveSessionsToStorage(sessions);
  },

  /**
   * POST /api/auth/logout-all
   * Revokes all active sessions
   */
  async logoutAllSessions(): Promise<SessionApiResponse> {
    await delay(300);
    saveSessionsToStorage([]);
    return {
      max_devices: MAX_ALLOWED_DEVICES,
      active_devices: 0,
      devices: [],
    };
  },

  /**
   * Reset session store to seed values (useful for demo/testing)
   */
  async resetSessionsToSeed(): Promise<SessionApiResponse> {
    await delay(150);
    saveSessionsToStorage(INITIAL_SEED_SESSIONS);
    setCurrentDeviceIdInStorage("dev_win_laptop_01");
    return {
      max_devices: MAX_ALLOWED_DEVICES,
      active_devices: 2,
      devices: INITIAL_SEED_SESSIONS,
    };
  },
};
