"use client";

import { FormEvent, useState } from "react";

const contactEmail = "danahwebsolutions@gmail.com";
const contactPhone = "+91 8279271587";
const whatsappUrl = `https://wa.me/918279271587?text=${encodeURIComponent(
  "Hi Danah Web, I’m interested in discussing a project. Please get in touch.",
)}`;

export default function Contact({ onCheckout }: { onCheckout: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    setIsError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set(
      "access_key",
      process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
        "0ac8a385-9c73-4331-9236-386354213f9a",
    );

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send your message.");
      }

      setStatus("Thanks for reaching out. Your message has been sent.");
      form.reset();
    } catch (error) {
      setIsError(true);
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="mt-20 border-y border-white/10 bg-white/[0.025] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div className="pt-2">
          <div className="mb-4 inline-flex items-center gap-3 text-xs font-extrabold uppercase text-[#6366f1]">
            <span className="h-px w-9 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
            Contact
          </div>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Ready to level up your online game?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/64">
            Tell Danah Web where you want to go next. We’ll help shape the
            strategy, design, and launch plan around your goals.
          </p>

          <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-white/75">
            <a
              className="transition-colors hover:text-white"
              href="tel:+918279271587"
            >
              Call: {contactPhone}
            </a>
            <a
              className="break-all transition-colors hover:text-white"
              href={`mailto:${contactEmail}`}
            >
              Email: {contactEmail}
            </a>
            <a
              className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-5 text-sm font-extrabold text-emerald-200 transition-colors hover:bg-[#25D366]/20"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp about your project
            </a>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-[#161920] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.38)] sm:p-7">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-bold text-white/80"
                htmlFor="contact-name"
              >
                Name
              </label>
              <input
                autoComplete="name"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#6366f1]"
                id="contact-name"
                name="name"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-bold text-white/80"
                htmlFor="contact-email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#6366f1]"
                id="contact-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-bold text-white/80"
                htmlFor="contact-phone"
              >
                Phone
              </label>
              <input
                autoComplete="tel"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#6366f1]"
                id="contact-phone"
                name="phone"
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-bold text-white/80"
                htmlFor="contact-message"
              >
                Message
              </label>
              <textarea
                className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#6366f1]"
                id="contact-message"
                name="message"
                placeholder="Tell us a little about your project"
                required
                rows={4}
              />
            </div>

            {status && (
              <p
                aria-live="polite"
                className={`text-sm ${isError ? "text-amber-200" : "text-emerald-200"}`}
              >
                {status}
              </p>
            )}

            <button
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#6366f1] px-6 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Sending message..." : "Send project inquiry"}
            </button>
            <button
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-extrabold text-white transition-all duration-300 hover:border-[#6366f1] hover:bg-[#6366f1]/10"
              onClick={onCheckout}
              type="button"
            >
              Lock In Project
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
