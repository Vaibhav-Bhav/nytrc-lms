import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/app/screens/auth/LoginScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NYtrc LMS — Login" },
      {
        name: "description",
        content: "NYtrc Learning Management System Login Portal",
      },
    ],
  }),
  component: LoginScreen,
});
