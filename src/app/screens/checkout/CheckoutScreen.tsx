import React, { useState } from "react";
import { ArrowLeft, Lock, BookOpen, CreditCard, ArrowRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { INITIAL_COURSES, INDIAN_STATES } from "../../../data/mockData";
import { lmsService } from "../../../services/lmsService";
import { Logo } from "../../components/Logo";
import { FormInput } from "../../components/FormInput";
import { Button, cn } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";

const COURSE_IMG = "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=900&h=500&fit=crop&auto=format";

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const COURSE = INITIAL_COURSES[0];
  const [fullName, setFullName] = useState("Sarah Chen");
  const [email, setEmail] = useState("sarah.chen@example.com");
  const [mobile, setMobile] = useState("9876543210");
  const [state, setState] = useState("Maharashtra");
  const [agreeTC, setAgreeTC] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeRefund, setAgreeRefund] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    mobile?: string;
    state?: string;
    consent?: string;
  }>({});

  const subtotal = 12500;
  const gstRate = state ? 0.18 : 0;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + gst;

  const allConsentsGiven = agreeTC && agreePrivacy && agreeRefund;

  function validateForm(): boolean {
    const newErrors: typeof errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full legal name.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    const digitsOnly = mobile.replace(/\D/g, "");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(digitsOnly)) {
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!state) {
      newErrors.state = "Please select your state for GST calculation.";
    }

    if (!allConsentsGiven) {
      newErrors.consent = "You must agree to Terms & Conditions, Privacy Policy, and Refund Policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors before proceeding.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Request backend order creation
      const order = await lmsService.createCheckoutOrder({
        fullName,
        email,
        mobile,
        state,
        courseId: COURSE.id,
      });

      toast.info(`Razorpay order created: ${order.orderId}`);

      // Step 2: Simulate Razorpay checkout verification
      onNavigate("payment-processing");

      const verifyRes = await lmsService.verifyPayment({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_RzP_${Date.now().toString().slice(-8)}`,
        razorpay_signature: "simulated_hmac_signature_hash",
        customer: { fullName, email, mobile, state },
      });

      if (verifyRes.success) {
        toast.success("Payment verified & course access granted!");
        onNavigate("payment-success");
      } else {
        toast.error(verifyRes.message || "Payment verification failed.");
        onNavigate("payment-failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
      onNavigate("payment-failed");
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
          onClick={() => onNavigate("student-dashboard")}
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
                      <option key={s} value={s}>
                        {s}
                      </option>
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
                !allConsentsGiven && <p className="text-xs text-muted-foreground mt-4 font-medium">You must agree to all policies to proceed.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 lg:sticky lg:top-20">
              <h2 className="font-bold text-foreground text-base mb-4">Order Summary</h2>

              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img src={COURSE_IMG} alt={COURSE.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-snug">{COURSE.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{COURSE.instructor}</p>
                  <p className="text-xs text-muted-foreground">{COURSE.lessonCount || 15} lessons · Lifetime access</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Course price</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
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
                  {state ? `₹${total.toLocaleString("en-IN")}` : `₹${subtotal.toLocaleString("en-IN")}+`}
                </span>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                <CreditCard className="w-4 h-4" />
                Proceed to payment
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

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
