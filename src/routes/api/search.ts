import { createFileRoute } from "@tanstack/react-router";
import { authenticate } from "../../middleware/auth";
import { supabase } from "../../lib/supabase";

export interface SearchResultItem {
  id: string;
  type: "course" | "lesson" | "student" | "payment";
  title: string;
  subtitle: string;
  link: string;
}

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await authenticate(request).catch(() => null);
          const url = new URL(request.url);
          const q = (url.searchParams.get("q") || "").trim().toLowerCase();

          if (!q || q.length < 2) {
            return Response.json({ results: [] }, { status: 200 });
          }

          const results: SearchResultItem[] = [];

          // 1. Search Courses
          const { data: courses } = await supabase
            .from("courses")
            .select("id, title, description, status")
            .ilike("title", `%${q}%`)
            .limit(5);

          if (courses) {
            for (const c of courses) {
              if (user?.role === "admin" || c.status === "published") {
                results.push({
                  id: c.id,
                  type: "course",
                  title: c.title,
                  subtitle: c.description || "Course",
                  link: user?.role === "admin" ? `/admin/content` : `/student/courses`,
                });
              }
            }
          }

          // 2. Search Lessons
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id, title, description, section_id")
            .ilike("title", `%${q}%`)
            .limit(5);

          if (lessons) {
            for (const l of lessons) {
              results.push({
                id: l.id,
                type: "lesson",
                title: l.title,
                subtitle: l.description || "Lesson",
                link: user?.role === "admin" ? `/admin/content` : `/student/courses`,
              });
            }
          }

          // 3. Search Students (Admin only)
          if (user?.role === "admin") {
            const { data: students } = await supabase
              .from("users")
              .select("id, name, email, mobile, role")
              .eq("role", "student")
              .or(`name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%`)
              .limit(5);

            if (students) {
              for (const s of students) {
                results.push({
                  id: s.id,
                  type: "student",
                  title: s.name,
                  subtitle: `${s.email} • ${s.mobile || "No phone"}`,
                  link: `/admin/students/${s.id}`,
                });
              }
            }

            // 4. Search Payments / Invoices (Admin only)
            const { data: payments } = await supabase
              .from("payments")
              .select("id, razorpay_order_id, amount_paid, payment_status")
              .or(`razorpay_order_id.ilike.%${q}%,razorpay_payment_id.ilike.%${q}%`)
              .limit(3);

            if (payments) {
              for (const p of payments) {
                results.push({
                  id: p.id,
                  type: "payment",
                  title: `Order: ${p.razorpay_order_id || p.id}`,
                  subtitle: `₹${p.amount_paid} • Status: ${p.payment_status}`,
                  link: `/admin/payments`,
                });
              }
            }
          }

          return Response.json({ results }, { status: 200 });
        } catch (err: any) {
          console.error("[api/search GET] Error:", err);
          return Response.json(
            { error: err.message || "Failed to search" },
            { status: 500 }
          );
        }
      },
    },
  },
});
