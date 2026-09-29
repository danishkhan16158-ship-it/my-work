"use client";

import { useEffect, useMemo, useState } from "react";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Founder from "@/components/Founder";
import Pricing, {
  pricingPlans,
  type PricingPlanKey,
} from "@/components/Pricing";

const MERCHANT_NAME = "Danah Web";
const MERCHANT_VPA = "8279271587@ptsbi";
const ACCENT = "#6366f1";

const pricingData = {
  INR: { starter: 4999, business: 9999, custom: 19999 },
} as const;

const currencyMeta = {
  INR: { locale: "en-IN" },
} as const;

function formatPrice(value: number, currency: keyof typeof pricingData) {
  const digits = new Intl.NumberFormat(currencyMeta[currency].locale, {
    maximumFractionDigits: 0,
  }).format(value);

  return `₹${digits}`;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      return resolve(true);
    }

    const existing = document.getElementById("razorpay-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PaymentModal({
  open,
  onClose,
  selectedPlan,
  amount,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  selectedPlan: string;
  amount: number;
  currency: keyof typeof pricingData;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  const retainer = useMemo(() => Math.round(amount * 0.3), [amount]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    setLoading(false);
    setMessage("");
    setErrorMessage("");
    setSuccess(false);
    setPaymentId("");
    setIsDismissed(false);

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const createOrder = async () => {
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: retainer,
        currency,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to create order.");
    }

    return data;
  };

  const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Payment verification failed.");
    }

    return data;
  };

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const scriptReady = await loadRazorpayScript();

      if (!scriptReady || !(window as any).Razorpay) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const orderData = await createOrder();

      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_ThAPDN87Yf8fbD";

      const razorpayInstance = new (window as any).Razorpay({
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: MERCHANT_NAME,
        description: "Project Retainer Deposit",
        order_id: orderData.order_id,
        theme: { color: ACCENT },
        prefill: {
          name: "Client",
          email: "client@danahweb.com",
        },
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccess(true);
            setPaymentId(response.razorpay_payment_id);
            setMessage("Payment verified successfully.");
            setLoading(false);
          } catch (verifyError: any) {
            setSuccess(false);
            setLoading(false);
            setErrorMessage(
              verifyError.message || "Payment verification failed.",
            );
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setIsDismissed(true);
            setErrorMessage(
              "Checkout was dismissed. You can retry the payment any time.",
            );
          },
        },
        notes: {
          merchant: MERCHANT_NAME,
          vpa: MERCHANT_VPA,
          plan: selectedPlan,
        },
      });

      razorpayInstance.open();
    } catch (error: any) {
      setSuccess(false);
      setLoading(false);
      setErrorMessage(error.message || "Payment failed. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#161920] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          aria-label="Close payment modal"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/80 transition-all hover:bg-white/10"
        >
          ×
        </button>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="border-b border-white/10 bg-gradient-to-br from-[#6366f1]/15 via-[#1a1d27] to-[#0d0f12] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a5b4fc]">
              Danah Web
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Secure Checkout
            </h3>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[#161920] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/55">
                  Selected Plan
                </span>
                <span className="rounded-full border border-[#6366f1]/35 bg-[#6366f1]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#dfe3ff]">
                  {selectedPlan}
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <span>Currency</span>
                  <strong className="text-white">{currency}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Project Total</span>
                  <strong className="text-white">
                    {formatPrice(amount, currency)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Retainer (30%)</span>
                  <strong className="text-[#a5b4fc]">
                    {formatPrice(retainer, currency)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                Retainer Deposit
              </p>
              <p className="mt-1 text-xs leading-6 text-emerald-100">
                Pay a {formatPrice(retainer, currency)} deposit to initiate
                milestone architecture and project planning.
              </p>
            </div>
          </aside>

          <div className="p-6 sm:p-8">
            {success ? (
              <div className="rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-300">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">
                      Payment Confirmed
                    </p>
                    <h4 className="mt-1 text-xl font-extrabold text-white">
                      Retainer Received
                    </h4>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-500/20 bg-[#0d0f12] p-4 text-sm text-white/75">
                  <div className="flex items-center justify-between gap-3">
                    <span>Payment ID</span>
                    <strong className="font-mono text-white">
                      {paymentId}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Merchant</span>
                    <strong className="text-white">{MERCHANT_NAME}</strong>
                  </div>
                </div>

                <a
                  href={`https://wa.me/918279271587?text=${encodeURIComponent(
                    `Hi Danah Web, my retainer deposit is confirmed! My Payment ID is: ${paymentId}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-[#04140d] shadow-[0_18px_40px_rgba(37,211,102,0.22)] transition-all duration-300 hover:-translate-y-1"
                >
                  Connect on WhatsApp to Begin
                </a>
              </div>
            ) : (
              <>
                <div className="mb-5 inline-flex rounded-full border border-white/10 bg-[#0d0f12] p-1">
                  <span className="rounded-full bg-[#6366f1] px-4 py-2 text-xs font-extrabold text-white">
                    Razorpay Gateway
                  </span>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0f12] p-5 text-sm leading-7 text-white/70">
                  <div className="flex items-center justify-between gap-3">
                    <span>Due Today (30%)</span>
                    <strong className="text-xl font-extrabold text-white">
                      {formatPrice(retainer, currency)}
                    </strong>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#6366f1]/20 bg-[#6366f1]/10 p-3 text-xs text-[#dfe3ff]">
                    Verified Merchant: {MERCHANT_NAME} ({MERCHANT_VPA})
                  </div>
                </div>

                {errorMessage && (
                  <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">
                    {errorMessage}
                  </div>
                )}

                {isDismissed && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0f12] p-3 text-xs text-white/70">
                    Checkout was dismissed. Click below when you are ready to
                    retry.
                  </div>
                )}

                {message && (
                  <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#6366f1] px-6 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Preparing Checkout..." : "Pay Retainer Deposit"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanKey>("starter");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const currentPrice = pricingData.INR[selectedPlan];

  const openCheckout = (plan: PricingPlanKey) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0d0f12] text-white antialiased">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0f12]/75 shadow-[0_16px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-10">
            <a
              href="#home"
              className="flex items-center gap-3"
              aria-label="Danah Web home"
            >
              <img
                src="/danah-web-bgc.png"
                alt="Danah Web"
                className="h-10 w-auto max-w-[44px] rounded-xl object-contain sm:h-12 sm:max-w-[64px] lg:max-w-[150px]"
              />
              <span className="text-sm font-extrabold text-white sm:text-base">
                Danah Web
              </span>
            </a>

            <nav
              className="hidden items-center gap-7 text-sm font-bold text-white/75 md:flex"
              aria-label="Primary navigation"
            >
              <a
                href="#home"
                className="transition-colors duration-300 hover:text-white"
              >
                Home
              </a>
              <a
                href="#services"
                className="transition-colors duration-300 hover:text-white"
              >
                Services
              </a>
              <a
                href="#pricing"
                className="transition-colors duration-300 hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="transition-colors duration-300 hover:text-white"
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openCheckout("starter")}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-3 text-xs font-extrabold text-white shadow-[0_16px_38px_rgba(99,102,241,0.28)] transition-all duration-300 hover:-translate-y-1 sm:min-h-[46px] sm:px-5 sm:text-sm"
              >
                Client Portal
              </button>
            </div>
          </div>
        </header>

        <main
          id="home"
          className="mx-auto w-full max-w-7xl px-6 pb-20 pt-28 sm:px-8 lg:px-10 lg:pb-24 lg:pt-32"
        >
          <section className="grid items-center gap-12 lg:grid-cols-[1.04fr_.82fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-3 text-xs font-extrabold uppercase text-[#6366f1]">
                <span className="h-px w-9 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
                Premium Web Studio
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                We Turn Your Vision Into A Premium Digital Experience.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                Danah Web — A modern web development studio crafting fast,
                responsive, and conversion-focused websites.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-7 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(99,102,241,0.36)]"
                >
                  Free Consultation
                </a>
                <a
                  href="#pricing"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/45 bg-white/[0.03] px-7 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f1] hover:bg-[#6366f1]/10"
                >
                  View Pricing
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#161920] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.38)] sm:p-7">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0f12] p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a5b4fc]">
                  Quick Launch Snapshot
                </p>
                <div className="mt-5 space-y-4 text-white/75">
                  <div className="flex items-center justify-between gap-3">
                    <span>Custom Design</span>
                    <span className="font-bold text-white">3 Weeks</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Performance Score</span>
                    <span className="font-bold text-emerald-300">98/100</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Marketing-Ready Architecture</span>
                    <span className="font-bold text-white">Included</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Pricing onSelectPlan={openCheckout} />
          <Contact onCheckout={() => openCheckout(selectedPlan)} />
        </main>
      </div>

      <Founder />
      <Footer />

      <PaymentModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        amount={currentPrice}
        currency="INR"
      />
    </>
  );
}
