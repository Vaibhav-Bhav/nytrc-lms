import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Sparkles,
  BookOpen,
  FileText,
  Users,
  CreditCard,
  X,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { DarkToggle } from "./DarkToggle";
import { toast } from "sonner";
import { useAuth, authQueryKey } from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface SearchResultItem {
  id: string;
  type: "course" | "lesson" | "student" | "payment";
  title: string;
  subtitle: string;
  link: string;
}

export function Header({
  onOpenMobileMenu,
  role = "Student",
  userName,
  userEmail,
}: {
  onOpenMobileMenu?: () => void;
  role?: "Student" | "Admin";
  userName?: string;
  userEmail?: string;
}) {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const actualRole = user?.role === "admin" ? "Admin" : role || "Student";
  const actualName = user?.name || (actualRole === "Admin" ? "Admin User" : "Student User");
  const actualEmail = user?.email || (actualRole === "Admin" ? "admin@nytrc.org" : "student@example.com");
  const initials =
    actualName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || (actualRole === "Admin" ? "AD" : "ST");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch real-time notifications with polling
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return { notifications: [] };
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const notifications: NotificationItem[] = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 2. Search query API fetcher
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 5. Search submit handler
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowSearchDropdown(false);
    const q = searchQuery.trim();

    if (actualRole === "Student") {
      navigate({ to: "/student/courses", search: { q } as any });
    } else {
      navigate({ to: "/admin/students", search: { q } as any });
    }
  }

  // 6. Mark notifications as read handler
  async function handleMarkAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Marked all notifications as read");
        refetchNotifications();
      }
    } catch {
      toast.error("Failed to update notifications");
    }
  }

  async function handleLogout() {
    setShowProfileMenu(false);
    setShowNotifications(false);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status !== 404) {
          toast.error(d.error ?? "Logout failed. Please try again.");
          return;
        }
      }
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Network error during logout.");
    } finally {
      queryClient.setQueryData(authQueryKey, null);
      queryClient.invalidateQueries({ queryKey: authQueryKey });
      navigate({ to: "/login" });
    }
  }

  function formatTimeAgo(isoString: string) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getSearchResultIcon(type: SearchResultItem["type"]) {
    switch (type) {
      case "course":
        return <BookOpen className="w-4 h-4 text-primary" />;
      case "lesson":
        return <FileText className="w-4 h-4 text-info-foreground" />;
      case "student":
        return <Users className="w-4 h-4 text-success-foreground" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-warning-foreground" />;
    }
  }

  return (
    <header className="h-[68px] bg-card border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors duration-200">
      {/* Left side: Mobile menu toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div ref={searchContainerRef} className="relative w-full max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
              }}
              placeholder="Search courses, lessons, students, resources..."
              className="w-full h-10 pl-10 pr-10 text-sm bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </form>

          {/* Search Quick Results Dropdown Overlay */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-border text-[11px] font-medium text-muted-foreground flex justify-between items-center">
                <span>Search results for "{searchQuery}"</span>
                {isSearching && <span className="animate-pulse text-primary">Searching...</span>}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate({ to: item.link as "/" });
                      }}
                      className="p-3 hover:bg-muted/60 transition-colors cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {getSearchResultIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {item.type}
                      </span>
                    </div>
                  ))
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No matching courses, lessons or users found.
                    <button
                      onClick={handleSearchSubmit}
                      className="block mx-auto mt-2 text-primary hover:underline font-semibold"
                    >
                      Press Enter to see all results →
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <DarkToggle />

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-border mx-1" />


        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">{actualName}</span>
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                {actualRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2.5 mb-1 border-b border-border">
                <p className="text-xs font-semibold text-foreground">{actualName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{actualEmail}</p>
              </div>

              <div className="space-y-0.5">
                {actualRole === "Student" ? (
                  <>
                    <Link
                      to="/student/account"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Account & Invoices
                    </Link>
                    <Link
                      to="/student/courses"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-4 h-4 text-warning-foreground" />
                      My Learning Path
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Admin Control Panel
                    </Link>
                    <Link
                      to="/admin/create-course"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-4 h-4 text-success-foreground" />
                      Create New Course
                    </Link>
                  </>
                )}
              </div>

              <div className="my-1 border-t border-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-error-foreground hover:bg-error-light rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
