import React, { useState, useEffect } from "react";
import { ArrowLeft, Lock, BookOpen, CreditCard, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { INDIAN_STATES } from "../../../data/mockData";
import { Logo } from "../../components/Logo";
import { FormInput } from "../../components/FormInput";
import { Button, cn } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";
import { useAuth } from "../../../hooks/useAuth";

// Razorpay global type declaration
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const COURSE_IMG = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=900&h=500&fit=crop&auto=format";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TK03y9m11Qr5I5";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  thumbnail_url?: string | null;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { data: user } = useAuth();
  const [course, setCourse] = useState<EnrolledCourse | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [agreeTC, setAgreeTC] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string; email?: string; mobile?: string; state?: string; consent?: string;
  }>({});

  // Pre-fill form from authenticated user
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Load the first available published course from the student's context
  useEffect(() => {
    async function loadCourse() {
      setCourseLoading(true);
      try {
        // Fetch all published courses (public endpoint – no auth required for course list)
        const res = await fetch("/api/admin/courses", { credentials: "include" });
        if (res.ok) {
          const courses: EnrolledCourse[] = await res.json();
          const published = courses.find((c) => c.status === "published") || courses[0];
          if (published) setCourse(published);
        }
      } catch {
        // If fetch fails, fall back to mock price
      } finally {
        setCourseLoading(false);
      }
    }
    loadCourse();
  }, []);

  const coursePrice = course?.price ?? 12500;
  const gstRate = state ? 0.18 : 0;
  const gst = Math.round(coursePrice * gstRate);
  const total = coursePrice + gst;

  const allConsentsGiven = agreeTC && agreePrivacy && agreeRefund;

  function validateForm(): boolean {
    const newErrors: typeof errors = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      newErrors.fullName = "Please enter your full legal name.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim()))
      newErrors.email = "Please enter a valid email address.";
    const digitsOnly = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digitsOnly))
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number.";
    if (!state) newErrors.state = "Please select your state for GST calculation.";
    if (!allConsentsGiven)
      newErrors.consent = "You must agree to Terms & Conditions, Privacy Policy, and Refund Policy.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors before proceeding.");
      return;
    }
    if (!user?.id) {
      toast.error("You must be logged in to proceed with payment.");
      return;
    }
    if (!course) {
      toast.error("No course found to purchase.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // Step 2: Create Razorpay order on our backend
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          course_id: course.id,
          student_id: user.id,
          gst_state: state,
        }),
      });

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        throw new Error(body.error || `Order creation failed: ${orderRes.status}`);
      }

      const { orderId, amount, currency } = await orderRes.json();
      toast.info(`Order created: ${orderId}`);

      // Step 3: Open Razorpay checkout modal
      onNavigate?.("payment-processing");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY_ID,
          amount,
          currency: currency || "INR",
          name: "NYTRC",
          description: course.title,
          order_id: orderId,
          prefill: {
            name: fullName,
            email: email,
            contact: mobile,
          },
          notes: {
            student_id: user.id,
            course_id: course.id,
            gst_state: state,
          },
          theme: { color: "#4F46E5" },

          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Step 4: Verify payment signature on backend
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                toast.success("Payment verified & course access granted!");
                onNavigate?.("payment-success");
              } else {
                const body = await verifyRes.json().catch(() => ({}));
                toast.error(body.error || "Payment verification failed.");
                onNavigate?.("payment-failed");
              }
              resolve();
            } catch (err: any) {
              toast.error(err.message || "Payment verification failed.");
              onNavigate?.("payment-failed");
              reject(err);
            }
          },

          modal: {
            ondismiss: () => {
              toast.warning("Payment cancelled. You can try again anytime.");
              onNavigate?.("checkout");
              resolve();
            },
          },
        });

        rzp.open();
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
      onNavigate?.("payment-failed");
    } finally {
      setLoading(false);
    }
  }

  const Checkbox = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
          checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
        )}
        onClick={onChange}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      <span className="text-sm text-muted-foreground leading-snug">
        I agree to the{" "}
        <a href="#" className="text-primary hover:underline font-medium">
          {label}
        </a>
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => onNavigate?.("student-dashboard")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Back</span>
        </button>
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Secured by Razorpay</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Complete your enrollment</h1>
          <p className="text-muted-foreground text-sm mt-1">Review your order and enter your details to proceed.</p>
        </div>

        <form onSubmit={handleProceed} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-4">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <FormInput
                  label="Full name"
                  placeholder="Your legal name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  error={errors.fullName}
                  required
                />
                <FormInput
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={errors.email}
                  required
                />
                <FormInput
                  label="Mobile number"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                  }}
                  error={errors.mobile}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    State <span className="text-muted-foreground font-normal">(for GST)</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
                    }}
                    required
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-lg border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer",
                      errors.state ? "border-destructive" : "border-border"
                    )}
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state ? (
                    <p className="text-xs text-destructive">{errors.state}</p>
                  ) : (
                    !state && <p className="text-xs text-muted-foreground">Select your state to calculate applicable GST.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-foreground text-base mb-4">Agreement & Policies</h2>
              <div className="flex flex-col gap-3.5">
                <Checkbox checked={agreeTC} onChange={() => setAgreeTC((v) => !v)} label="Terms & Conditions" />
                <Checkbox checked={agreePrivacy} onChange={() => setAgreePrivacy((v) => !v)} label="Privacy Policy" />
                <Checkbox checked={agreeRefund} onChange={() => setAgreeRefund((v) => !v)} label="Refund Policy" />
              </div>
              {errors.consent ? (
                <p className="text-xs text-destructive mt-3 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.consent}
                </p>
              ) : (
                !allConsentsGiven && (
                  <p className="text-xs text-muted-foreground mt-4 font-medium">You must agree to all policies to proceed.</p>
                )
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 lg:sticky lg:top-20">
              <h2 className="font-bold text-foreground text-base mb-4">Order Summary</h2>

              {courseLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading course details...</span>
                </div>
              ) : (
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={course?.thumbnail_url || COURSE_IMG}
                      alt={course?.title || "Course"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-snug">{course?.title || "NYTRC Course"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Lifetime access · All sections included</p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Course price</span>
                  <span className="font-semibold text-foreground">₹{coursePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    GST (18%){!state && <span className="ml-1 text-xs text-warning-foreground">(select state)</span>}
                  </span>
                  <span className={cn("font-semibold", state ? "text-foreground" : "text-muted-foreground")}>
                    {state ? `₹${gst.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-foreground">Total Amount</span>
                <span className="text-lg font-extrabold text-foreground">
                  {state ? `₹${total.toLocaleString("en-IN")}` : `₹${coursePrice.toLocaleString("en-IN")}+`}
                </span>
              </div>

              <Button type="submit" loading={loading} className="w-full" disabled={!user}>
                <CreditCard className="w-4 h-4" />
                Proceed to payment
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

              {!user && (
                <p className="text-xs text-destructive mt-2 text-center font-medium">
                  Please log in to proceed with payment.
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground font-medium">
                <Lock className="w-3.5 h-3.5" />
                Payments secured by Razorpay
              </div>
            </div>

            <SupportCard type="payment" />
          </div>
        </form>
      </main>
    </div>
  );
}
