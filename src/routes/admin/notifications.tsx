import { createFileRoute } from "@tanstack/react-router";
import { AdminNotifications } from "../../app/screens/admin/AdminNotifications";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});
