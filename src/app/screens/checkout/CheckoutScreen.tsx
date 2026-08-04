import React, { useState } from "react";
import { ArrowLeft, Lock, BookOpen, CreditCard, ArrowRight, Check } from "lucide-react";
import { Screen } from "../../../data/types";
import { INITIAL_COURSES, INDIAN_STATES } from "../../../data/mockData";
import { Logo } from "../../components/Logo";
import { FormInput } from "../../components/FormInput";
import { Button, cn } from "../../components/Button";
import { SupportCard } from "../../components/SupportCard";

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const COURSE = INITIAL_COURSES[0];
  const [fullName, setFullName] = useState("Sarah Chen");
  const [email, setEmail] = useState("sarah.chen@example.com");
  const [mobile, setMobile] = useState("+91 98765 43210");
  const [state, setState] = useState("");
  const [agreeTC, setAgreeTC] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = 12500;
  const gstRate = state ? 0.18 : 0;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + gst;

  const allConsentsGiven = agreeTC && agreePrivacy && agreeRefund;
  const canProceed = fullName && email && mobile && state && allConsentsGiven;

  function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceed) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate("payment-processing");
    }, 1000);
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
      <header className="h-14 bg-card border-b border-border flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30">
        <button
          onClick={() => onNavigate("student-dashboard")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Secured by Razorpay</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Complete your enrollment</h1>
          <p className="text-muted-foreground text-sm mt-1">Review your order and enter your details to proceed.</p>
        </div>

        <form onSubmit={handleProceed} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="flex flex-col gap-5">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <FormInput
                  label="Full name"
                  placeholder="Your legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <FormInput
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormInput
                  label="Mobile number"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    State <span className="text-muted-foreground font-normal">(for GST)</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {!state && <p className="text-xs text-muted-foreground">Select your state to calculate applicable GST.</p>}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
              <h2 className="font-semibold text-foreground mb-4">Agreement</h2>
              <div className="flex flex-col gap-3.5">
                <Checkbox checked={agreeTC} onChange={() => setAgreeTC((v) => !v)} label="Terms & Conditions" />
                <Checkbox checked={agreePrivacy} onChange={() => setAgreePrivacy((v) => !v)} label="Privacy Policy" />
                <Checkbox checked={agreeRefund} onChange={() => setAgreeRefund((v) => !v)} label="Refund Policy" />
              </div>
              {!allConsentsGiven && <p className="text-xs text-muted-foreground mt-4">You must agree to all policies to proceed.</p>}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 lg:sticky lg:top-20">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">{COURSE.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{COURSE.instructor}</p>
                  <p className="text-xs text-muted-foreground">{COURSE.lessonCount || 15} lessons · Lifetime access</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course price</span>
                  <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    GST (18%){!state && <span className="ml-1 text-xs">(select state)</span>}
                  </span>
                  <span className={cn("font-medium", state ? "text-foreground" : "text-muted-foreground")}>
                    {state ? `₹${gst.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">
                  {state ? `₹${total.toLocaleString("en-IN")}` : `₹${subtotal.toLocaleString("en-IN")}+`}
                </span>
              </div>

              <Button type="submit" loading={loading} disabled={!canProceed} className="w-full">
                <CreditCard className="w-4 h-4" />
                Proceed to payment
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
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
