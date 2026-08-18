import { createFileRoute } from "@tanstack/react-router";
import { authenticate } from "../../middleware/auth";
import {
  getNotificationsForUser,
  markNotificationsAsRead,
} from "../../services/notification";

export const Route = createFileRoute("/api/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await authenticate(request).catch(() => null);
          if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const role = user.role === "admin" ? "admin" : "student";
          const items = await getNotificationsForUser(user.id, role);

          return Response.json({ notifications: items }, { status: 200 });
        } catch (err: any) {
          console.error("[api/notifications GET] Error:", err);
          return Response.json(
            { error: err.message || "Failed to fetch notifications" },
            { status: 500 }
          );
        }
      },

      PATCH: async ({ request }) => {
        try {
          const user = await authenticate(request).catch(() => null);
          if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          let notificationIds: string[] | undefined = undefined;
          try {
            const body = await request.json();
            if (Array.isArray(body?.ids)) {
              notificationIds = body.ids;
            }
          } catch {
            // No body provided means mark all as read
          }

          const success = await markNotificationsAsRead(user.id, notificationIds);

          return Response.json({ success }, { status: 200 });
        } catch (err: any) {
          console.error("[api/notifications PATCH] Error:", err);
          return Response.json(
            { error: err.message || "Failed to update notifications" },
            { status: 500 }
          );
        }
      },
    },
  },
});
