import { supabase } from "../lib/supabase";

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  target_role?: "student" | "admin" | "all" | null;
  title: string;
  message: string;
  type: "course_update" | "invoice_paid" | "welcome" | "new_enrollment" | "system";
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationInput {
  userId?: string | null;
  targetRole?: "student" | "admin" | "all" | null;
  title: string;
  message: string;
  type?: "course_update" | "invoice_paid" | "welcome" | "new_enrollment" | "system";
  link?: string | null;
}

// In-memory store for active session events (used as fall-through when DB table is being created)
const inMemoryNotifications: NotificationItem[] = [];

export async function createNotification(input: CreateNotificationInput): Promise<NotificationItem> {
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    user_id: input.userId || null,
    target_role: input.targetRole || "all",
    title: input.title,
    message: input.message,
    type: input.type || "system",
    link: input.link || null,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Always store in memory array so it displays live immediately
  inMemoryNotifications.unshift(newItem);

  try {
    const payload = {
      user_id: input.userId || null,
      target_role: input.targetRole || "all",
      title: input.title,
      message: input.message,
      type: input.type || "system",
      link: input.link || null,
      is_read: false,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      return data as NotificationItem;
    }
  } catch (err) {
    // Supabase insert fallback to inMemoryNotifications
  }

  return newItem;
}

export async function getNotificationsForUser(
  userId: string,
  userRole: "admin" | "student"
): Promise<NotificationItem[]> {
  try {
    const roleTarget = userRole === "admin" ? "admin" : "student";

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},target_role.eq.${roleTarget},target_role.eq.all`)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data && data.length > 0) {
      return data as NotificationItem[];
    }
  } catch (err) {
    // Ignore and fallback to inMemoryNotifications
  }

  // Filter inMemoryNotifications by target user/role
  const roleTarget = userRole === "admin" ? "admin" : "student";
  return inMemoryNotifications.filter(
    (n) =>
      n.user_id === userId ||
      n.target_role === roleTarget ||
      n.target_role === "all" ||
      !n.target_role
  );
}

export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<boolean> {
  // Mark in-memory notifications as read
  inMemoryNotifications.forEach((n) => {
    if (!notificationIds || notificationIds.includes(n.id)) {
      n.is_read = true;
    }
  });

  try {
    let query = supabase.from("notifications").update({ is_read: true });

    if (notificationIds && notificationIds.length > 0) {
      query = query.in("id", notificationIds);
    } else {
      query = query.or(`user_id.eq.${userId},target_role.eq.student,target_role.eq.admin,target_role.eq.all`);
    }

    await query;
    return true;
  } catch (err) {
    return true;
  }
}
