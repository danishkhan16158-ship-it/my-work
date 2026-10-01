"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

type PlanKey = "starter" | "business" | "custom";
type AuditReport = { score: number; fcp: string; lcp: string; cls: string };
type ChatMessage = {
  sender: "ai" | "user";
  text: string;
  links?: { label: string; href: string }[];
};
type PortalUser = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  profilePicture: string;
};
type PortalTab = "otp" | "google";

const plans: Record<PlanKey, { name: string; total: number; deposit: number }> =
  {
    starter: { name: "Starter Landing Page", total: 4999, deposit: 1500 },
    business: { name: "Business Growth", total: 9999, deposit: 3000 },
    custom: { name: "Custom Web Application", total: 19999, deposit: 6000 },
  };

export default function Home() {
  // State Management
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "AED">(
    "INR",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalDrawerOpen, setPortalDrawerOpen] = useState(false);
  const [portalTab, setPortalTab] = useState<PortalTab>("otp");
  const [portalIdentifier, setPortalIdentifier] = useState("");
  const [portalOtp, setPortalOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSeconds, setOtpSeconds] = useState(0);
  const [portalBusy, setPortalBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [portalNotice, setPortalNotice] = useState("");
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [profileDraft, setProfileDraft] = useState<PortalUser | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hi! How can Danah Web help elevate your brand today?",
    },
  ]);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [auditUrl, setAuditUrl] = useState("");
  const [auditName, setAuditName] = useState("");
  const [auditEmail, setAuditEmail] = useState("");
  const [auditPhone, setAuditPhone] = useState("");
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [auditError, setAuditError] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  // Project Estimator State
  const [pages, setPages] = useState(1);
  const [hasEcommerce, setHasEcommerce] = useState(false);
  const [hasSEO, setHasSEO] = useState(true);
  const [hasCMS, setHasCMS] = useState(false);

  // Live Booking Notification State
  const [currentNotification, setCurrentNotification] = useState<{
    name: string;
    location: string;
    plan: string;
  } | null>(null);

  const rates = { INR: 1, USD: 0.012, EUR: 0.011, AED: 0.044 };
  const symbols = { INR: "₹", USD: "$", EUR: "€", AED: "AED " };

  const formatCurrency = (inrAmount: number) =>
    `${symbols[currency]}${(inrAmount * rates[currency]).toLocaleString(
      currency === "INR" ? "en-IN" : "en-US",
      { maximumFractionDigits: currency === "INR" ? 0 : 2 },
    )}`;

  // 50 Dynamic Booking Popups Data
  const bookingData = [
    { name: "Aarav M.", location: "Mumbai, India", plan: "Business Growth" },
    { name: "Sarah L.", location: "Dubai, UAE", plan: "Custom Application" },
    {
      name: "Vikram R.",
      location: "Bengaluru, India",
      plan: "Starter Landing Page",
    },
    { name: "John D.", location: "New York, USA", plan: "Business Growth" },
    { name: "Priya S.", location: "Delhi, India", plan: "Custom Application" },
    { name: "David K.", location: "London, UK", plan: "Starter Landing Page" },
    {
      name: "Ananya P.",
      location: "Hyderabad, India",
      plan: "Business Growth",
    },
    {
      name: "Ahmed H.",
      location: "Abu Dhabi, UAE",
      plan: "Custom Application",
    },
    { name: "Rohan V.", location: "Pune, India", plan: "Starter Landing Page" },
    { name: "Elena R.", location: "Berlin, Germany", plan: "Business Growth" },
    {
      name: "Siddharth K.",
      location: "Jaipur, India",
      plan: "Business Growth",
    },
    {
      name: "Michael B.",
      location: "Toronto, Canada",
      plan: "Custom Application",
    },
    {
      name: "Meera Nair",
      location: "Kochi, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Karan Sharma",
      location: "Chandigarh, India",
      plan: "Business Growth",
    },
    {
      name: "Omar Al-Mansoor",
      location: "Riyadh, Saudi Arabia",
      plan: "Custom Application",
    },
    {
      name: "Tanya Verma",
      location: "Gurugram, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Liam O'Connor",
      location: "Dublin, Ireland",
      plan: "Business Growth",
    },
    {
      name: "Neha Gupta",
      location: "Noida, India",
      plan: "Custom Application",
    },
    {
      name: "Carlos M.",
      location: "Madrid, Spain",
      plan: "Starter Landing Page",
    },
    {
      name: "Rahul Deshmukh",
      location: "Thane, India",
      plan: "Business Growth",
    },
    {
      name: "Fatima Khan",
      location: "Doha, Qatar",
      plan: "Custom Application",
    },
    {
      name: "Suresh Menon",
      location: "Chennai, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Alexander Wright",
      location: "Sydney, Australia",
      plan: "Business Growth",
    },
    {
      name: "Pooja Malhotra",
      location: "Ludhiana, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Devendra Patel",
      location: "Ahmedabad, India",
      plan: "Custom Application",
    },
    {
      name: "Sophie Martin",
      location: "Paris, France",
      plan: "Business Growth",
    },
    {
      name: "Arjun Reddy",
      location: "Visakhapatnam, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Hassan Al-Zahrani",
      location: "Jeddah, Saudi Arabia",
      plan: "Custom Application",
    },
    {
      name: "Ritu Joshi",
      location: "Dehradun, India",
      plan: "Business Growth",
    },
    {
      name: "Lucas Silva",
      location: "São Paulo, Brazil",
      plan: "Starter Landing Page",
    },
    {
      name: "Kabir Mehta",
      location: "Kolkata, India",
      plan: "Custom Application",
    },
    { name: "Emma Watson", location: "London, UK", plan: "Business Growth" },
    {
      name: "Aman Preet",
      location: "Amritsar, India",
      plan: "Starter Landing Page",
    },
    { name: "Youssef N.", location: "Dubai, UAE", plan: "Business Growth" },
    {
      name: "Divya Agarwal",
      location: "Indore, India",
      plan: "Custom Application",
    },
    { name: "Benjamin Lee", location: "Singapore", plan: "Business Growth" },
    {
      name: "Sanjay Singhania",
      location: "Surat, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Zaid Sheikh",
      location: "Sharjah, UAE",
      plan: "Custom Application",
    },
    {
      name: "Ishita Roy",
      location: "Bhubaneswar, India",
      plan: "Business Growth",
    },
    {
      name: "Oliver Smith",
      location: "Auckland, New Zealand",
      plan: "Starter Landing Page",
    },
    {
      name: "Gaurav Sen",
      location: "Lucknow, India",
      plan: "Custom Application",
    },
    {
      name: "Hamdan Al-Maktoum",
      location: "Dubai, UAE",
      plan: "Business Growth",
    },
    {
      name: "Tarun Kapoor",
      location: "Shimla, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Chloe Bennett",
      location: "Los Angeles, USA",
      plan: "Custom Application",
    },
    {
      name: "Manish Chhabra",
      location: "Faridabad, India",
      plan: "Business Growth",
    },
    {
      name: "Tariq Aziz",
      location: "Muscat, Oman",
      plan: "Starter Landing Page",
    },
    {
      name: "Shruti Saxena",
      location: "Bhopal, India",
      plan: "Business Growth",
    },
    {
      name: "Noah Miller",
      location: "Chicago, USA",
      plan: "Custom Application",
    },
    {
      name: "Rajesh Iyer",
      location: "Coimbatore, India",
      plan: "Starter Landing Page",
    },
    {
      name: "Nasser Al-Thani",
      location: "Doha, Qatar",
      plan: "Business Growth",
    },
  ];

  // Rotation logic for 3-second live popups
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentNotification(bookingData[index]);
      index = (index + 1) % bookingData.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const revealTargets =
      document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealTargets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!otpSent || otpSeconds <= 0) return;
    const timeout = window.setTimeout(() => {
      setOtpSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [otpSent, otpSeconds]);

  useEffect(() => {
    if (!portalOpen && !portalDrawerOpen) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPortalOpen(false);
        setPortalDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [portalOpen, portalDrawerOpen]);

  useEffect(() => {
    let cancelled = false;
    const hydratePortal = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.success || !result.user) {
          window.localStorage.removeItem("danah_portal_user");
          return;
        }

        const verifiedUser = result.user as PortalUser;
        const storedValue = window.localStorage.getItem("danah_portal_user");
        let storedUser: PortalUser | null = null;
        if (storedValue) {
          try {
            storedUser = JSON.parse(storedValue) as PortalUser;
          } catch {
            window.localStorage.removeItem("danah_portal_user");
          }
        }
        const restoredUser =
          storedUser?.email?.toLowerCase() === verifiedUser.email.toLowerCase()
            ? { ...verifiedUser, ...storedUser, email: verifiedUser.email }
            : verifiedUser;
        if (!cancelled) {
          setPortalUser(restoredUser);
          setProfileDraft(restoredUser);
          window.localStorage.setItem(
            "danah_portal_user",
            JSON.stringify(restoredUser),
          );
        }
      } catch {
        window.localStorage.removeItem("danah_portal_user");
      }
    };
    void hydratePortal();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate Estimator Price
  const calculateEstimate = () => {
    let base = pages * 1500;
    if (hasEcommerce) base += 4000;
    if (hasSEO) base += 2000;
    if (hasCMS) base += 2500;
    return Math.round(base * rates[currency]);
  };

  const scrollToSearchResult = (rawQuery: string) => {
    const query = rawQuery.trim().toLowerCase();
    const destinations: Record<string, string> = {
      pricing: "pricing",
      prices: "pricing",
      faq: "faq",
      faqs: "faq",
      services: "services",
      seo: "services",
      estimator: "estimator",
      razorpay: "pricing",
      founder: "founder",
      contact: "contact",
    };
    const targetId = destinations[query];
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const saveAuthenticatedPortalUser = (user: PortalUser) => {
    setPortalUser(user);
    setProfileDraft(user);
    window.localStorage.setItem("danah_portal_user", JSON.stringify(user));
    setPortalOpen(false);
    setPortalDrawerOpen(true);
    setPortalNotice("");
    setOtpSent(false);
    setPortalOtp("");
  };

  const handleSendPortalOtp = async () => {
    const value = portalIdentifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^\d{10}$/.test(value);

    setPortalError("");
    setPortalNotice("");
    setPortalOtp("");
    if (isPhone) {
      setPortalError(
        "SMS sign-in is not configured yet. Use email OTP for now.",
      );
      return;
    }
    if (!isEmail) {
      setPortalError("Enter a valid email address.");
      return;
    }

    setPortalBusy(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEmail ? { email: value } : { phone: value }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send a verification code.",
        );
      }
      if (result.devOtp && process.env.NODE_ENV === "development") {
        console.info("Danah Web development OTP:", result.devOtp);
        setPortalNotice(
          `Resend delivery was unavailable. Use the development code logged in this browser console.`,
        );
      } else {
        setPortalNotice(`A verification code was sent to ${value}.`);
      }
      setOtpSent(true);
      setOtpSeconds(result.expiresInSeconds || 60);
    } catch (error) {
      setOtpSent(false);
      setPortalError(
        error instanceof Error ? error.message : "Unable to send OTP.",
      );
    } finally {
      setPortalBusy(false);
    }
  };

  const handleVerifyPortalOtp = async () => {
    setPortalError("");
    if (!otpSent || otpSeconds === 0) {
      setPortalError("The code has expired. Request a new code to continue.");
      return;
    }
    if (!/^\d{6}$/.test(portalOtp)) {
      setPortalError("Enter the 6-digit verification code.");
      return;
    }

    setPortalBusy(true);
    try {
      const value = portalIdentifier.trim();
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, otp: portalOtp }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.message || "Code verification failed.");
      }
      saveAuthenticatedPortalUser(result.user as PortalUser);
    } catch (error) {
      setPortalError(
        error instanceof Error ? error.message : "Code verification failed.",
      );
    } finally {
      setPortalBusy(false);
    }
  };

  const handleGooglePortal = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleIdentity = (window as any).google?.accounts?.id;
    if (!clientId || !googleReady || !googleIdentity) {
      setPortalError(
        "Google sign-in is not ready. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID and reload the page.",
      );
      return;
    }

    setPortalBusy(true);
    setPortalError("");
    const nonceBytes = new Uint8Array(32);
    window.crypto.getRandomValues(nonceBytes);
    const nonce = Array.from(nonceBytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    window.sessionStorage.setItem("danah_google_nonce", nonce);
    googleIdentity.initialize({
      client_id: clientId,
      nonce,
      callback: async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
          window.sessionStorage.removeItem("danah_google_nonce");
          setPortalBusy(false);
          setPortalError("Google did not return a sign-in credential.");
          return;
        }
        try {
          const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credential: credentialResponse.credential,
              nonce,
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.success || !result.user) {
            throw new Error(
              result.message || "Google sign-in could not be verified.",
            );
          }
          saveAuthenticatedPortalUser(result.user as PortalUser);
        } catch (error) {
          setPortalError(
            error instanceof Error ? error.message : "Google sign-in failed.",
          );
        } finally {
          window.sessionStorage.removeItem("danah_google_nonce");
          setPortalBusy(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    googleIdentity.prompt((notification: any) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        window.sessionStorage.removeItem("danah_google_nonce");
        setPortalBusy(false);
        setPortalError(
          "Google sign-in was unavailable. Try OTP sign-in instead.",
        );
      }
    });
  };

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileDraft) return;
    setPortalUser(profileDraft);
    window.localStorage.setItem(
      "danah_portal_user",
      JSON.stringify(profileDraft),
    );
    setPortalNotice("Profile details updated for this session.");
  };

  const handleProfilePicture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileDraft || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileDraft((profile) =>
          profile
            ? { ...profile, profilePicture: reader.result as string }
            : profile,
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePortalLogout = () => {
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.localStorage.removeItem("danah_portal_user");
    setPortalUser(null);
    setProfileDraft(null);
    setPortalDrawerOpen(false);
    setPortalOpen(false);
    setPortalIdentifier("");
    setPortalOtp("");
    setOtpSent(false);
    setPortalNotice("");
    setPortalError("");
  };

  const handleWebsiteAudit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setAuditError("");
    setAuditReport(null);

    try {
      const parsedUrl = new URL(auditUrl.trim());
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error(
          "Enter a website URL beginning with http:// or https://.",
        );
      }
      setAuditLoading(true);
      setAnalyzedUrl("");

      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      if (!accessKey) throw new Error("Web3Forms is not configured.");

      const leadResponse = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "New Speed Audit Lead",
          name: auditName.trim(),
          email: auditEmail.trim(),
          phone: auditPhone.trim(),
          website: parsedUrl.href,
        }),
      });
      const leadResult = await leadResponse.json();
      if (!leadResponse.ok || !leadResult.success) {
        throw new Error(
          leadResult.message || "Unable to submit your audit request.",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      const seed = Array.from(parsedUrl.href).reduce(
        (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
        7,
      );
      const score = 32 + (seed % 37);
      const fcp = (2.8 + ((seed >>> 3) % 19) / 10).toFixed(1);
      const lcp = (4.1 + ((seed >>> 7) % 28) / 10).toFixed(1);
      const cls = (0.22 + ((seed >>> 11) % 24) / 100).toFixed(2);

      setAuditReport({ score, fcp, lcp, cls });
      setAnalyzedUrl(parsedUrl.hostname);
    } catch (error) {
      setAnalyzedUrl("");
      setAuditReport(null);
      setAuditError(
        error instanceof Error
          ? error.message
          : "Enter a valid website URL and try again.",
      );
    } finally {
      setAuditLoading(false);
    }
  };

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setContactSubmitting(true);
    setContactMessage("");
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setContactSubmitting(false);
      setContactMessage(
        "Contact form is not configured. Please email us directly.",
      );
      return;
    }

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...values,
          access_key: accessKey,
          subject: "New Danah Web Inquiry",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send your enquiry.");
      }
      form.reset();
      setContactMessage("Thanks, your enquiry has been sent.");
    } catch (error) {
      setContactMessage(
        error instanceof Error ? error.message : "Unable to send your enquiry.",
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  const startCheckout = async (planKey: PlanKey) => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      setCheckoutMessage(
        "Payments are not configured yet. Please contact us to reserve this plan.",
      );
      return;
    }
    if (!razorpayReady || !window.Razorpay) {
      setCheckoutMessage(
        "Secure checkout is still loading. Please try again shortly.",
      );
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage("");

    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, currency: "INR" }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Could not create a payment order.",
        );
      }

      const checkout = new window.Razorpay({
        key,
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Danah Web Studio",
        description: `${plans[planKey].name} - 30% project retainer`,
        image: "/danah-web-bgc.png",
        theme: { color: "#8b5cf6" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = await verifyResponse.json();
            if (!verifyResponse.ok || !verification.success) {
              throw new Error(
                verification.message || "Payment verification failed.",
              );
            }
            setCheckoutMessage(
              `Payment confirmed for ${plans[planKey].name}. Payment ID: ${response.razorpay_payment_id}`,
            );
          } catch (error) {
            setCheckoutMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Contact us with your payment ID.",
            );
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
        notes: {
          plan: planKey,
          retainer_amount_inr: String(plans[planKey].deposit),
          display_currency: currency,
        },
      });

      checkout.open();
    } catch (error) {
      setCheckoutLoading(false);
      setCheckoutMessage(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
    }
  };

  const getAssistantAnswer = (input: string): ChatMessage => {
    const query = input.toLowerCase();

    if (/price|pricing|package|cost|retainer|deposit|plan/.test(query)) {
      return {
        sender: "ai",
        text: "Danah Web offers three packages: Starter Landing Page ₹4,999 with a ₹1,500 retainer; Business Growth ₹9,999 with a ₹3,000 retainer; and Custom Web Application ₹19,999 with a ₹6,000 retainer. The deposit is due to reserve your project, with the remaining balance due at project sign-off. Currency conversions are estimates; payment currencies depend on Razorpay account settings.",
        links: [{ label: "Compare packages", href: "#pricing" }],
      };
    }

    if (
      /tech|stack|next|tailwind|typescript|node|express|mongo|hosting|razorpay|stripe/.test(
        query,
      )
    ) {
      return {
        sender: "ai",
        text: "Our full-stack toolkit includes Next.js 14 App Router, React, Tailwind CSS, and TypeScript on the frontend; Node.js and Express APIs with MongoDB where the product needs a database; Vercel or Netlify deployments; and Razorpay or Stripe payment integrations.",
        links: [{ label: "Explore services", href: "#services" }],
      };
    }

    if (/time|timeline|delivery|days|how long/.test(query)) {
      return {
        sender: "ai",
        text: "Typical delivery targets are 3–5 days for a Starter Landing Page, 7 days for Business Growth, and 14 days for a Custom Web App. Timing can vary with scope, content readiness, feedback, and external integrations.",
        links: [{ label: "View pricing and plans", href: "#pricing" }],
      };
    }

    if (/seo|lighthouse|performance|core web vitals|guarantee/.test(query)) {
      return {
        sender: "ai",
        text: "We optimize technical SEO, OpenGraph metadata, schema markup, responsive images, mobile behavior, and Core Web Vitals. The target is 90+ Lighthouse performance where the agreed scope and third-party scripts allow; results depend on content, integrations, hosting, and real-world conditions. Edge caching helps reduce time to first byte.",
        links: [{ label: "Open the Speed Auditor", href: "#audit" }],
      };
    }

    if (/audit|analy[sz]e|website url|speed tool|speed/.test(query)) {
      return {
        sender: "ai",
        text: "The Speed Auditor is in the Speed Audit section. Enter your name, email, phone number, and website URL; after the lead form is accepted, it runs a three-second simulated scan and shows a variable performance score, Core Web Vitals, and practical recommendations. It is a predictor, not a live Google PageSpeed measurement.",
        links: [{ label: "Go to Speed Audit", href: "#audit" }],
      };
    }

    if (
      /service|feature|design|e.?commerce|cms|api|chatbot|support/.test(query)
    ) {
      return {
        sender: "ai",
        text: "Services cover Next.js 14 App Router architecture; bespoke Tailwind CSS and UI/UX; e-commerce and Razorpay/Stripe checkout; technical SEO and Core Web Vitals; custom APIs, headless CMS and database work; plus AI chatbot and customer-support integrations.",
        links: [{ label: "See all services", href: "#services" }],
      };
    }

    if (/founder|danish|vision|approach|who are you/.test(query)) {
      return {
        sender: "ai",
        text: "Danish Khan is Danah Web’s founder and lead developer. His approach is to replace slow, outdated websites with carefully engineered, mobile-first digital experiences that load quickly, support business goals, and help turn visits into enquiries. The agency pairs direct communication with modern full-stack delivery.",
        links: [
          { label: "Meet Danish Khan", href: "#founder" },
          { label: "Book a project conversation", href: "#contact" },
        ],
      };
    }

    if (/contact|call|phone|whatsapp|message|speak|book|consult/.test(query)) {
      return {
        sender: "ai",
        text: "You can contact Danish Khan and the Danah Web team directly or send a project enquiry through the contact form.",
        links: [
          { label: "Call +91 8279271587", href: "tel:+918279271587" },
          { label: "Message on WhatsApp", href: "https://wa.me/918279271587" },
          { label: "Open contact form", href: "#contact" },
        ],
      };
    }

    return {
      sender: "ai",
      text: "I can help with packages, delivery timelines, full-stack services, technology, the Speed Auditor, performance and SEO, founder information, or booking a call. Which would you like to explore?",
      links: [
        { label: "Pricing", href: "#pricing" },
        { label: "Contact", href: "#contact" },
      ],
    };
  };

  const sendChatSuggestion = (prompt: string) => {
    setMessages((previous) => [
      ...previous,
      { sender: "user", text: prompt },
      getAssistantAnswer(prompt),
    ]);
  };

  const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userText = chatInput.trim();
    if (!userText) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userText },
    ]);
    setChatInput("");
    window.setTimeout(() => {
      setMessages((previous) => [...previous, getAssistantAnswer(userText)]);
    }, 350);
  };

  const faqs = [
    {
      q: "What technologies do you use for web development?",
      a: "We build modern, ultra-fast web applications using Next.js 14, React, Tailwind CSS, TypeScript, and Node.js.",
    },
    {
      q: "How long does it take to complete a project?",
      a: "A Starter Landing Page takes 3–5 business days, while Business Growth and Custom Web Apps take 7–14 days.",
    },
    {
      q: "Do you offer post-launch support and maintenance?",
      a: "Yes, all plans include complimentary 30-day technical support, bug fixes, and deployment assistance.",
    },
    {
      q: "Can I accept online payments on my website?",
      a: "Absolutly. We integrate Razorpay, Stripe, and UPI payment gateways for seamless payment flows.",
    },
    {
      q: "Is the website search engine optimized (SEO)?",
      a: "Yes, every site is built with technical SEO, meta tags, schema markup, and OpenGraph tags out of the box.",
    },
    {
      q: "Will my website work smoothly on mobile phones?",
      a: "100%. All modern layouts are engineered mobile-first and fully responsive across all device breakpoints.",
    },
    {
      q: "How does the payment structure work?",
      a: "We charge a 30% retainer deposit upfront to begin work, with the remaining balance due upon full project sign-off.",
    },
    {
      q: "Can you help me connect a custom domain name?",
      a: "Yes, we handle complete DNS configurations and SSL certificate setups on platforms like Netlify, Vercel, or Cloudflare.",
    },
    {
      q: "Do you provide custom content writing and graphics?",
      a: "We can write high-converting web copy and design custom vectors, banners, and branded imagery for your site.",
    },
    {
      q: "Can I manage or edit content myself later?",
      a: "Yes, we can integrate headless CMS tools like Sanity, Strapi, or Decap CMS so you can update text and media easily.",
    },
    {
      q: "What makes Next.js better than standard WordPress?",
      a: "Next.js offers superior loading speed, top-tier security with serverless architecture, and zero risk of plugin vulnerabilities.",
    },
    {
      q: "Do you offer web hosting setup?",
      a: "Yes, we set up automated deployment pipelines on Vercel or Netlify with high-availability edge global CDNs.",
    },
    {
      q: "Can you redesign my existing website?",
      a: "Definitely. We migrate outdated websites onto high-performance Next.js stacks while preserving existing SEO authority.",
    },
    {
      q: "Is Web3Forms integration secure for contact forms?",
      a: "Yes, Web3Forms processes form submissions securely without exposing backend mailer credentials or API keys.",
    },
    {
      q: "Can you integrate custom WhatsApp chat widgets?",
      a: "Yes, we add direct floating WhatsApp triggers that auto-fill customized message prompts from visitors.",
    },
    {
      q: "Do you build custom web apps with user login portal?",
      a: "Yes, our Custom Web Application plan includes authentication setups via NextAuth, Firebase, or Clerk.",
    },
    {
      q: "What files or access do I need to provide to start?",
      a: "You just need your logo, text content (if available), brand guidelines, and domain registrar access.",
    },
    {
      q: "Are there any hidden recurring fees?",
      a: "No hidden fees. Hosting on platforms like Netlify and Vercel is free for standard traffic volumes.",
    },
    {
      q: "Which currencies can I use to view pricing?",
      a: "You can view converted estimates in INR, USD, EUR, and AED. Final payment options depend on the Razorpay account's international payment settings.",
    },
    {
      q: "How do we get started with Danah Web?",
      a: "Select your desired plan, pay the 30% retainer, or send us an inquiry directly through our contact form!",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050711] font-sans tracking-normal text-slate-100 selection:bg-purple-500 selection:text-white">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setRazorpayReady(true)}
        onError={() =>
          setCheckoutMessage(
            "Secure checkout could not load. Please refresh and try again.",
          )
        }
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setGoogleReady(true)}
        onError={() =>
          setPortalError("Google Identity Services could not load.")
        }
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setGoogleReady(true)}
        onError={() =>
          setPortalError("Google Identity Services could not load.")
        }
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-45"
        style={{
          backgroundImage: "radial-gradient(#1e1b4b 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[70vh] bg-[radial-gradient(ellipse_120%_120%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 top-20 z-0 h-96 w-96 rounded-full bg-purple-900/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 top-[35rem] z-0 h-[28rem] w-[28rem] rounded-full bg-indigo-900/20 blur-[120px]"
      />
      <style jsx global>{`
        @keyframes danah-float {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }
        .animate-float {
          animation: danah-float 6s ease-in-out infinite;
        }
        [data-reveal] {
          opacity: 0;
          transform: translateY(22px) scale(0.99);
          transition:
            opacity 650ms ease,
            transform 650ms ease;
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none;
          }
          [data-reveal] {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
      <div className="relative z-10">
        {/* FIXED TOP NAVIGATION BAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-[#050711]/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/danah-web-bgc.png"
                alt="Danah Web logo"
                className="h-10 w-10 rounded-xl border border-white/10 object-cover shadow-lg shadow-indigo-500/20"
              />
              <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Danah Web
              </span>
            </div>

            <div className="hidden items-center space-x-5 text-sm font-medium text-slate-300 xl:flex">
              <a
                href="#services"
                className="hover:text-purple-400 transition-colors"
              >
                Services
              </a>
              <a
                href="#results"
                className="hover:text-purple-400 transition-colors"
              >
                Results
              </a>
              <a
                href="#pricing"
                className="hover:text-purple-400 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#audit"
                className="hover:text-purple-400 transition-colors"
              >
                Speed Audit
              </a>
              <a
                href="#estimator"
                className="hover:text-purple-400 transition-colors"
              >
                Estimator
              </a>
              <a
                href="#faq"
                className="hover:text-purple-400 transition-colors"
              >
                FAQ
              </a>
              <a
                href="#contact"
                className="hover:text-purple-400 transition-colors"
              >
                Contact
              </a>
            </div>

            <form
              role="search"
              className="order-3 flex w-full items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-slate-300 transition-colors focus-within:border-indigo-500 md:order-none md:w-44 lg:w-52"
              onSubmit={(event) => {
                event.preventDefault();
                scrollToSearchResult(searchQuery);
              }}
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                aria-label="Search page sections"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  scrollToSearchResult(value);
                }}
                placeholder="Search sections"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-300 outline-none placeholder:text-slate-500"
              />
            </form>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (portalUser) {
                    setProfileDraft(portalUser);
                    setPortalDrawerOpen(true);
                  } else {
                    setPortalError("");
                    setPortalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-2.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 sm:px-4 sm:text-sm"
              >
                {portalUser?.profilePicture ? (
                  <img
                    src={portalUser.profilePicture}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : portalUser ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-500/30 text-[10px]">
                    {portalUser.fullName.slice(0, 1).toUpperCase()}
                  </span>
                ) : null}
                <span className="sm:hidden">
                  {portalUser ? "My Portal" : "Portal"}
                </span>
                <span className="hidden sm:inline">
                  {portalUser ? "My Portal" : "Client Portal"}
                </span>
              </button>
              <a
                href="#pricing"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-purple-500 sm:px-4 sm:text-sm"
              >
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get Started</span>
              </a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION WITH HOVERING GRAPHIC GRAPH & FLOATING BADGES */}
        <section
          data-reveal
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 pb-20 pt-32 sm:gap-10 sm:px-6 sm:pt-36 lg:grid-cols-2 lg:gap-12 lg:px-8"
        >
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              PREMIUM WEB STUDIO
            </div>

            <h1
              className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl"
              style={{ textShadow: "0 0 28px rgba(129, 140, 248, 0.18)" }}
            >
              We Turn Your Vision Into A{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Premium Digital Experience.
              </span>
            </h1>

            <p className="mt-6 text-slate-400 text-base sm:text-lg leading-relaxed">
              Danah Web engineers high-performance Next.js applications,
              conversion-driven landing pages, and luxury digital interfaces
              tailored to grow modern businesses.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/30"
              >
                Explore Services
              </a>
              <a
                href="https://wa.me/918279271587?text=Hi%20Danah%20Web%2C%20I%20want%20to%20discuss%20a%20project%21"
                target="_blank"
                className="border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* HERO GRAPHIC WITH HOVERING OVERLAY BADGES */}
          <div className="relative order-1 mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center overflow-visible px-6 py-8 sm:px-8 sm:py-12 lg:order-2">
            <div className="pointer-events-none absolute inset-[6%] -rotate-12 rounded-[32px] border border-cyan-400/10" />
            <div className="pointer-events-none absolute inset-[2%] rotate-6 rounded-[32px] border border-indigo-400/15" />
            <div className="animate-float relative mx-auto aspect-square w-full max-w-[280px] rounded-[32px] border border-slate-800 bg-[#10131E]/90 p-4 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-sm sm:max-w-[340px] sm:p-5">
              <div className="mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.65)]"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.65)]"></span>
              </div>

              <div className="space-y-3 font-mono text-[10px] text-purple-300 sm:space-y-4 sm:text-xs">
                <div className="rounded-lg border border-cyan-400/10 bg-slate-950 p-2.5">
                  <div className="h-1.5 w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
                </div>
                <div className="ml-3 rounded-lg border border-indigo-400/10 bg-slate-950 p-2.5">
                  <div className="h-1.5 w-3/5 rounded-full bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500 opacity-80" />
                </div>
                <div className="ml-3 rounded-lg border border-purple-400/10 bg-slate-950 p-2.5">
                  <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-400 opacity-70" />
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="h-1.5 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 opacity-60" />
                </div>
              </div>

              {/* HOVERING FLOATING BADGES */}
              <div className="animate-float absolute -right-4 -top-4 rounded-full border border-cyan-500/30 bg-[#1C2034] px-2.5 py-1 text-[10px] font-bold text-cyan-400 shadow-lg sm:px-3 sm:py-1.5 sm:text-xs">
                &lt;/&gt;
              </div>

              <div className="animate-float absolute -bottom-4 -right-4 rounded-full border border-indigo-500/30 bg-[#1C2034] px-3 py-1 text-[10px] font-bold text-indigo-400 shadow-lg [animation-delay:1.2s] sm:px-4 sm:py-2 sm:text-xs">
                SEO
              </div>

              <div className="animate-float absolute -bottom-4 -left-4 rounded-full border border-purple-500/30 bg-[#1C2034] px-3 py-1 text-[10px] font-bold text-purple-400 shadow-lg [animation-delay:2.4s] sm:px-4 sm:py-2 sm:text-xs">
                UI
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SHOWCASE */}
        <section
          data-reveal
          id="services"
          className="mx-auto max-w-7xl border-t border-slate-900 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">
              Full-Stack Digital Solutions
            </h2>
            <p className="text-slate-400 mt-3 text-sm">
              Engineered with modern architecture to give your company a
              decisive technical advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "High-Performance Next.js 14 App Architecture",
                description:
                  "App Router architecture with fast rendering, resilient routing, and an optimized production build.",
              },
              {
                icon: "✦",
                title: "Bespoke Tailwind CSS & Luxury UI/UX Design",
                description:
                  "Responsive, distinctive interfaces shaped around your brand and your customers’ goals.",
              },
              {
                icon: "⇄",
                title: "E-Commerce & Payment Gateway Integration",
                description:
                  "Secure checkout flows and payment integrations with Razorpay, Stripe, and UPI.",
              },
              {
                icon: "◉",
                title: "Technical SEO, Speed & Core Web Vitals",
                description:
                  "Search-ready page structure, metadata, image delivery, and real performance improvements.",
              },
              {
                icon: "⌘",
                title: "Custom API, Headless CMS & Database Development",
                description:
                  "Purpose-built APIs and content/data systems that fit your workflows and product needs.",
              },
              {
                icon: "✳",
                title: "AI Chatbot & Customer Support Integration",
                description:
                  "Helpful, brand-aligned conversational experiences that route visitors to the right next step.",
              },
            ].map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7 transition-all hover:border-purple-500/50"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-xl font-bold text-purple-300">
                  {service.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* RESULTS & METRICS SECTION */}
        <section
          data-reveal
          id="results"
          className="border-y border-slate-900 bg-slate-900/30 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-white">
                Proven Performance Metrics
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Every application built by Danah Web is benchmarked for extreme
                performance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 text-center sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                <p className="text-4xl font-extrabold text-purple-400">
                  99/100
                </p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                  Lighthouse Speed
                </p>
              </div>
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                <p className="text-4xl font-extrabold text-indigo-400">
                  &lt; 0.8s
                </p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                  Load Time
                </p>
              </div>
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                <p className="text-4xl font-extrabold text-purple-400">100%</p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                  Mobile Responsive
                </p>
              </div>
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                <p className="text-4xl font-extrabold text-indigo-400">300%</p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                  Avg. Lead Growth
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SIMULATED CORE WEB VITALS AUDIT */}
        <section
          data-reveal
          id="audit"
          className="border-y border-slate-900 bg-slate-950/60 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">
                Performance Predictor
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                Test your website speed &amp; audit
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Share your contact details to receive a simulated Core Web
                Vitals report and an actionable optimization plan. This is not a
                live Google PageSpeed measurement.
              </p>
              <form
                onSubmit={handleWebsiteAudit}
                className="mt-7 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div>
                  <label
                    className="mb-2 block text-xs font-semibold text-slate-300"
                    htmlFor="audit-name"
                  >
                    Name
                  </label>
                  <input
                    id="audit-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={auditName}
                    onChange={(event) => setAuditName(event.target.value)}
                    placeholder="Your name"
                    className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold text-slate-300"
                      htmlFor="audit-email"
                    >
                      Email address
                    </label>
                    <input
                      id="audit-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={auditEmail}
                      onChange={(event) => setAuditEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold text-slate-300"
                      htmlFor="audit-phone"
                    >
                      Phone number
                    </label>
                    <input
                      id="audit-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={auditPhone}
                      onChange={(event) => setAuditPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <label className="sr-only" htmlFor="audit-url">
                  Website URL
                </label>
                <input
                  id="audit-url"
                  type="url"
                  inputMode="url"
                  required
                  value={auditUrl}
                  onChange={(event) => setAuditUrl(event.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={auditLoading}
                  className="min-h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                >
                  {auditLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Analyzing Core Web Vitals, TTFB, and DOM Size...
                    </span>
                  ) : (
                    "Analyze Speed"
                  )}
                </button>
              </form>
              {auditError && (
                <p role="alert" className="mt-3 text-sm text-amber-300">
                  {auditError}
                </p>
              )}
              {analyzedUrl && (
                <p aria-live="polite" className="mt-3 text-xs text-slate-400">
                  Sample audit for{" "}
                  <span className="text-slate-200">{analyzedUrl}</span>
                </p>
              )}
            </div>

            {analyzedUrl && auditReport ? (
              <div className="rounded-3xl border border-purple-500/20 bg-slate-900/70 p-6 shadow-2xl shadow-purple-950/20 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Simulated performance score
                    </p>
                    <p className="mt-2 text-5xl font-extrabold text-amber-300">
                      {auditReport.score}
                      <span className="text-xl text-slate-500">/100</span>
                    </p>
                    <span className="mt-2 inline-flex rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                      {auditReport.score < 50
                        ? "Red Alert"
                        : "Needs Improvement"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                      <p className="text-lg font-bold text-rose-300">
                        {auditReport.fcp}s
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        FCP
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                      <p className="text-lg font-bold text-rose-300">
                        {auditReport.lcp}s
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        LCP
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                      <p className="text-lg font-bold text-rose-300">
                        {auditReport.cls}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        CLS
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-7 border-t border-slate-800 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-white">
                      Danah Web optimization plan
                    </h3>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      Target: 99/100
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        title: "JavaScript Execution Overhead",
                        detail:
                          "Unused JavaScript is delaying the main thread by approximately 2.4 seconds.",
                      },
                      {
                        title: "Unoptimized Image Payloads",
                        detail:
                          "Serve Next-gen WebP/AVIF formats and responsive images through a CDN.",
                      },
                      {
                        title: "Render-Blocking CSS/Fonts",
                        detail:
                          "Inline critical CSS and enable font-display swapping to improve first paint.",
                      },
                      {
                        title: "Missing Edge Caching",
                        detail:
                          "Deploy serverless edge routing and caching to target a TTFB under 100ms.",
                      },
                    ].map((item, index) => (
                      <article
                        key={item.title}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-xs font-bold text-white">
                            {item.title}
                          </h4>
                          <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold uppercase text-rose-300">
                            {auditReport.score < 50 || index === 0
                              ? "Critical"
                              : "High"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {item.detail}
                        </p>
                      </article>
                    ))}
                  </div>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 text-center text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:brightness-110"
                  >
                    Book Free Call to Boost Score to 99/100
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-purple-500/20 bg-slate-900/70 p-8 text-center shadow-2xl shadow-purple-950/20">
                <div>
                  <p className="text-4xl text-purple-300">◎</p>
                  <p className="mt-4 font-bold text-white">
                    Your sample report will appear here
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Enter a URL to generate a simulated Core Web Vitals report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PRICING AND RAZORPAY CHECKOUT */}
        <section
          data-reveal
          id="pricing"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white">
              Transparent & Reduced Pricing
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Compare converted estimates and reserve your project with a 30%
              retainer deposit. Razorpay checkout is created in the selected
              currency when enabled for your account.
            </p>
            <div className="mt-6 inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1.5">
              {(["INR", "USD", "EUR", "AED"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={currency === option}
                  onClick={() => setCurrency(option)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                    currency === option
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* STARTER */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Starter Landing Page
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ideal for startups and personal branding
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatCurrency(plans.starter.total)}
                  </span>
                  <p className="text-xs text-purple-400 mt-1">
                    30% Deposit: {formatCurrency(plans.starter.deposit)} due
                    today
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✓ Single Page High-Converting Layout</li>
                  <li>✓ Fully Responsive Tailwind CSS</li>
                  <li>✓ Web3Forms Contact Integration</li>
                  <li>✓ 3-5 Days Delivery Time</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => startCheckout("starter")}
                className="mt-8 block w-full text-center bg-slate-800 hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60 text-white font-medium py-3 rounded-xl text-sm transition-all"
              >
                {checkoutLoading
                  ? "Opening secure checkout..."
                  : "Book Starter Plan"}
              </button>
            </div>

            {/* BUSINESS GROWTH - POPULAR */}
            <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-purple-500/10">
              <span className="absolute -top-3.5 right-8 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Business Growth
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Complete multi-page web presence
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatCurrency(plans.business.total)}
                  </span>
                  <p className="text-xs text-purple-400 mt-1">
                    30% Deposit: {formatCurrency(plans.business.deposit)} due
                    today
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✓ Up to 5 Custom React/Next.js Pages</li>
                  <li>✓ Payment Gateway Setup (Razorpay/Stripe)</li>
                  <li>✓ Technical SEO & Schema Tags</li>
                  <li>✓ Floating WhatsApp Direct Chat</li>
                  <li>✓ 7 Days Delivery Time</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => startCheckout("business")}
                className="mt-8 block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:cursor-wait disabled:opacity-60 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30"
              >
                {checkoutLoading
                  ? "Opening secure checkout..."
                  : "Book Growth Plan"}
              </button>
            </div>

            {/* CUSTOM WEB APP */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Custom Web Application
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bespoke full-stack digital products
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatCurrency(plans.custom.total)}
                  </span>
                  <p className="text-xs text-purple-400 mt-1">
                    30% Deposit: {formatCurrency(plans.custom.deposit)} due
                    today
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✓ Full Next.js App Router Architecture</li>
                  <li>✓ Dedicated Client Portal Integration</li>
                  <li>✓ Custom Database & API Endpoints</li>
                  <li>✓ AI Assistant Chatbot Setup</li>
                  <li>✓ 14 Days Delivery Time</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => startCheckout("custom")}
                className="mt-8 block w-full text-center bg-slate-800 hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60 text-white font-medium py-3 rounded-xl text-sm transition-all"
              >
                {checkoutLoading
                  ? "Opening secure checkout..."
                  : "Book Custom App"}
              </button>
            </div>
          </div>
          {checkoutMessage && (
            <p
              aria-live="polite"
              className="mx-auto mt-6 max-w-2xl rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-center text-sm text-purple-100"
            >
              {checkoutMessage}
            </p>
          )}
        </section>

        {/* PROJECT ESTIMATOR SECTION */}
        <section
          data-reveal
          id="estimator"
          className="border-y border-slate-900 bg-slate-900/30 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white">
                Interactive Project Estimator
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Calculate your custom web project cost instantaneously.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Pages: {pages}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <label className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEcommerce}
                    onChange={(e) => setHasEcommerce(e.target.checked)}
                    className="accent-purple-600 w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">
                    E-Commerce Gateway
                  </span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSEO}
                    onChange={(e) => setHasSEO(e.target.checked)}
                    className="accent-purple-600 w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">
                    Advanced SEO Setup
                  </span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCMS}
                    onChange={(e) => setHasCMS(e.target.checked)}
                    className="accent-purple-600 w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">
                    CMS Admin Panel
                  </span>
                </label>
              </div>

              <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400">Estimated Investment</p>
                  <p className="text-3xl font-extrabold text-purple-400">
                    {formatCurrency(calculateEstimate())}
                  </p>
                </div>
                <a
                  href="#contact"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Request This Estimate
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION */}
        <section
          data-reveal
          id="founder"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
            <img
              src="/danish-khan.jpg"
              alt="Danish Khan"
              className="w-28 h-28 rounded-full object-cover border-2 border-purple-500/50 shadow-xl flex-shrink-0"
            />
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
                Leadership
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Danish Khan — Founder & Lead Developer
              </h3>
              <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                "At Danah Web, I focus on engineering ultra-fast, modern web
                applications and landing pages using Next.js and Tailwind CSS.
                My goal is to help businesses replace outdated, slow websites
                with high-performing digital experiences that drive real
                revenue."
              </p>
            </div>
          </div>
        </section>

        {/* 20 EXPANDED FAQ SECTION */}
        <section
          data-reveal
          id="faq"
          className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Everything you need to know about working with Danah Web.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center font-medium text-slate-200 text-sm hover:text-purple-300"
                >
                  <span>{faq.q}</span>
                  <span className="text-purple-400 text-lg ml-4">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-slate-400 text-xs leading-relaxed border-t border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION WITH WEB3FORMS INTEGRATION */}
        <section
          data-reveal
          id="contact"
          className="mx-auto max-w-7xl border-t border-slate-900 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">
              Start Your Project Today
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Send us your details below or connect with us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Direct Details */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white">
                Direct Communication
              </h3>
              <div>
                <p className="text-xs text-slate-400">Direct Phone Support</p>
                <a
                  href="tel:+918279271587"
                  className="text-indigo-400 font-semibold text-lg hover:underline"
                >
                  +91 8279271587
                </a>
              </div>
              <div>
                <p className="text-xs text-slate-400">Official Inquiries</p>
                <a
                  href="mailto:danahwebsolutions@gmail.com"
                  className="text-indigo-400 font-semibold text-lg hover:underline"
                >
                  danahwebsolutions@gmail.com
                </a>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <a
                  href="https://wa.me/918279271587?text=Hi%20Danah%20Web%2C%20I%20want%20to%20discuss%20a%20project%21"
                  target="_blank"
                  className="w-full block text-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all text-sm"
                >
                  Chat Instantly on WhatsApp
                </a>
              </div>
            </div>

            {/* Web3Forms Action Form */}
            <form
              onSubmit={handleContactSubmit}
              className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-4"
            >
              <input
                type="hidden"
                name="subject"
                value="New Danah Web Inquiry"
              />
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <textarea
                name="message"
                rows={4}
                placeholder="Describe your web development requirements..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
              ></textarea>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:cursor-wait disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-purple-600/20"
              >
                {contactSubmitting ? "Sending inquiry..." : "Submit Inquiry"}
              </button>
              {contactMessage && (
                <p aria-live="polite" className="text-sm text-slate-300">
                  {contactMessage}
                </p>
              )}
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-900 bg-[#05050b] px-4 py-10 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white font-bold text-sm">DANAH WEB SOLUTIONS</p>
            <div className="flex space-x-6">
              <a
                href="mailto:danahwebsolutions@gmail.com"
                className="hover:text-purple-400"
              >
                Email
              </a>
              <a href="tel:+918279271587" className="hover:text-purple-400">
                Call
              </a>
              <a
                href="https://wa.me/918279271587"
                target="_blank"
                className="hover:text-purple-400"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <p className="mt-6">
            © 2026 Danah Web Solutions. All rights reserved.
          </p>
        </footer>

        {portalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              aria-label="Close Client Portal sign in"
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setPortalOpen(false)}
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="portal-title"
              className="relative z-10 my-auto w-full max-w-md rounded-3xl border border-slate-700 bg-[#10131E] p-5 shadow-[0_0_60px_rgba(99,102,241,0.2)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                    Danah Web
                  </p>
                  <h2
                    id="portal-title"
                    className="mt-2 text-2xl font-bold text-white"
                  >
                    Client Portal
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Sign in to view your project workspace.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close sign in dialog"
                  onClick={() => setPortalOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-700 text-slate-300 transition hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
                <button
                  type="button"
                  aria-pressed={portalTab === "otp"}
                  onClick={() => {
                    setPortalTab("otp");
                    setPortalError("");
                    setPortalNotice("");
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${portalTab === "otp" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  aria-pressed={portalTab === "google"}
                  onClick={() => {
                    setPortalTab("google");
                    setPortalError("");
                    setPortalNotice("");
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${portalTab === "google" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Google
                </button>
              </div>

              {portalTab === "otp" ? (
                <div className="mt-5 space-y-4">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSendPortalOtp();
                    }}
                    className="space-y-3"
                  >
                    <label
                      htmlFor="portal-identifier"
                      className="block text-sm font-semibold text-slate-200"
                    >
                      Email address
                    </label>
                    <input
                      id="portal-identifier"
                      autoComplete="username"
                      value={portalIdentifier}
                      onChange={(event) =>
                        setPortalIdentifier(event.target.value)
                      }
                      placeholder="name@example.com"
                      className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={portalBusy || (otpSent && otpSeconds > 0)}
                      className="min-h-12 w-full rounded-xl bg-slate-800 px-4 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {portalBusy
                        ? "Sending OTP..."
                        : otpSent && otpSeconds > 0
                          ? `Send OTP again (${otpSeconds}s)`
                          : "Send OTP"}
                    </button>
                  </form>

                  {otpSent && (
                    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="portal-otp"
                          className="text-sm font-semibold text-slate-200"
                        >
                          6-digit verification code
                        </label>
                        <span
                          className={`text-xs font-semibold ${otpSeconds ? "text-cyan-300" : "text-rose-300"}`}
                        >
                          {otpSeconds
                            ? `Expires in ${otpSeconds}s`
                            : "Code expired"}
                        </span>
                      </div>
                      <input
                        id="portal-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={portalOtp}
                        onChange={(event) =>
                          setPortalOtp(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="_ _ _ _ _ _"
                        className="min-h-14 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-center font-mono text-xl tracking-[0.35em] text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={!otpSeconds || portalBusy}
                        onClick={handleVerifyPortalOtp}
                        className="min-h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {portalBusy ? "Verifying..." : "Verify & Access Portal"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <p className="text-sm leading-6 text-slate-400">
                    Continue through your configured Google OAuth provider.
                    Account identity must be verified by your server callback.
                  </p>
                  <button
                    type="button"
                    disabled={portalBusy}
                    onClick={handleGooglePortal}
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 48 48"
                      className="h-5 w-5"
                    >
                      <path
                        fill="#4285F4"
                        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 17.9l6.8-5.2Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              )}

              {portalError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200"
                >
                  {portalError}
                </p>
              )}
              {portalNotice && (
                <p
                  aria-live="polite"
                  className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100"
                >
                  {portalNotice}
                </p>
              )}
              <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
                Email OTP and Google sign-in are verified on the server. Profile
                edits are saved in this browser; project and invoice data
                require an account integration.
              </p>
            </section>
          </div>
        )}

        {portalDrawerOpen && portalUser && profileDraft && (
          <div className="fixed inset-0 z-[125] flex justify-end">
            <button
              type="button"
              aria-label="Close My Portal"
              onClick={() => setPortalDrawerOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="my-portal-title"
              className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-[#090C16] shadow-2xl"
            >
              <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  {profileDraft.profilePicture ? (
                    <img
                      src={profileDraft.profilePicture}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500/20 font-bold text-indigo-200">
                      {profileDraft.fullName.slice(0, 1).toUpperCase() || "C"}
                    </span>
                  )}
                  <div>
                    <h2 id="my-portal-title" className="font-bold text-white">
                      My Portal
                    </h2>
                    <p className="max-w-56 truncate text-xs text-slate-400">
                      {profileDraft.email || profileDraft.phone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close portal drawer"
                  onClick={() => setPortalDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  ×
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">Profile Details</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Edit your contact and company information.
                      </p>
                    </div>
                    <label className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-purple-500/30 bg-slate-950 text-xs font-bold text-purple-200">
                      {profileDraft.profilePicture ? (
                        <img
                          src={profileDraft.profilePicture}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "Photo"
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleProfilePicture}
                      />
                    </label>
                  </div>
                  <form
                    onSubmit={handleSaveProfile}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label className="text-xs font-semibold text-slate-300">
                      Full Name
                      <input
                        required
                        value={profileDraft.fullName}
                        onChange={(event) =>
                          setProfileDraft((profile) =>
                            profile
                              ? { ...profile, fullName: event.target.value }
                              : profile,
                          )
                        }
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-300">
                      Email
                      <input
                        type="email"
                        value={profileDraft.email}
                        onChange={(event) =>
                          setProfileDraft((profile) =>
                            profile
                              ? { ...profile, email: event.target.value }
                              : profile,
                          )
                        }
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-300">
                      Phone Number
                      <input
                        type="tel"
                        value={profileDraft.phone}
                        onChange={(event) =>
                          setProfileDraft((profile) =>
                            profile
                              ? { ...profile, phone: event.target.value }
                              : profile,
                          )
                        }
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-300">
                      Company Name
                      <input
                        value={profileDraft.companyName}
                        onChange={(event) =>
                          setProfileDraft((profile) =>
                            profile
                              ? { ...profile, companyName: event.target.value }
                              : profile,
                          )
                        }
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </label>
                    <button
                      type="submit"
                      className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-500 sm:col-span-2"
                    >
                      Save Profile
                    </button>
                  </form>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                  <h3 className="font-bold text-white">
                    Project Access &amp; Settings
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Project data is not connected to this demo profile yet.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Active bookings
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        None linked
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Retainer receipts
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        No invoices
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Project status
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        Awaiting booking
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                  <h3 className="font-bold text-white">Help &amp; Support</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Get in touch with the Danah Web team.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDrawerOpen(false);
                        setChatOpen(true);
                      }}
                      className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-white transition hover:border-indigo-500"
                    >
                      Open AI Assistant
                    </button>
                    <a
                      href="https://wa.me/918279271587?text=Hi%20Danah%20Web%2C%20I%20need%20help%20with%20my%20project."
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      WhatsApp +91 8279271587
                    </a>
                  </div>
                </section>

                {portalNotice && (
                  <p
                    aria-live="polite"
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200"
                  >
                    {portalNotice}
                  </p>
                )}
              </div>

              <footer className="border-t border-slate-800 p-4 sm:px-6">
                <button
                  type="button"
                  onClick={handlePortalLogout}
                  className="min-h-11 w-full rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 text-sm font-bold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Log Out
                </button>
              </footer>
            </aside>
          </div>
        )}

        {/* 50 RECURRING UPCOMING LIVE BOOKING POPUP (3s INTERVAL) */}
        {currentNotification && (
          <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-purple-500/40 bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md animate-slide-up sm:bottom-6 sm:left-6 sm:right-auto">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 text-xs font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {currentNotification.name}{" "}
                <span className="text-slate-400 font-normal">
                  from {currentNotification.location}
                </span>
              </p>
              <p className="text-[10px] text-purple-300">
                Just booked:{" "}
                <span className="font-semibold text-white">
                  {currentNotification.plan}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* FLOATING AI ASSISTANT WIDGET AT EXACT SCREEN POSITION */}
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full shadow-2xl shadow-purple-600/50 flex items-center justify-center transition-all transform hover:scale-105"
            >
              <span className="text-2xl">💬</span>
            </button>
          ) : (
            <div className="flex h-[min(28rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-96 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between bg-purple-600 p-4 text-sm font-bold text-white">
                <span>Danah Web AI Assistant</span>
                <button
                  type="button"
                  aria-label="Close AI assistant"
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 p-3">
                {[
                  {
                    label: "View Pricing",
                    prompt: "Tell me about your pricing and 30% retainer",
                  },
                  { label: "Tech Stack", prompt: "What is your tech stack?" },
                  {
                    label: "Speed Guarantee",
                    prompt:
                      "Tell me about speed, SEO, and performance guarantee",
                  },
                  {
                    label: "Contact Founder",
                    prompt: "How can I contact founder Danish Khan?",
                  },
                ].map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => sendChatSuggestion(suggestion.prompt)}
                    className="min-w-0 rounded-lg border border-slate-700 bg-slate-800/70 px-2 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500/60 hover:bg-purple-500/10 hover:text-white"
                  >
                    <span className="block truncate">{suggestion.label}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] ${m.sender === "user" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-200"}`}
                    >
                      {m.text}
                      {m.links && (
                        <div className="mt-2 flex flex-col gap-2">
                          {m.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target={
                                link.href.startsWith("https:")
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                link.href.startsWith("https:")
                                  ? "noreferrer"
                                  : undefined
                              }
                              className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleChatSubmit}
                className="p-3 border-t border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about pricing or speed..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
