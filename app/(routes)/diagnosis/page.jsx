"use client";

import DiagnosisForm from "@/components/DiagnosisForm";
import { deriveSpecialtySearch } from "@/lib/diagnosisSpecialties";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";

const benefits = [
  {
    title: "Visual intelligence",
    description:
      "Upload photos so Herb can compare your symptoms with known presentations and uncover subtle clues.",
  },
  {
    title: "Guided next steps",
    description:
      "Receive ranked conditions, prevention tips, and care suggestions tailored to your description.",
  },
  {
    title: "Care navigation",
    description:
      "Jump straight into nearby specialists or urgent care locations based on the AI’s findings.",
  },
];

const DiagnosisPage = () => {
  const router = useRouter();

  const toBase64 = useCallback(async (file) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }, []);

  const handleSubmit = useCallback(
    async ({ symptoms, files }) => {
      const images = await Promise.all(
        (files ?? []).map(async (file) => ({
          mimeType: file.type || "image/jpeg",
          data: await toBase64(file),
        }))
      );

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          images,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message =
          errorPayload?.error ||
          "We couldn’t reach Herb right now. Please try again.";
        throw new Error(message);
      }

      const payload = await response.json();
      const caseId =
        (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
        `case-${Date.now()}`;

      const storagePayload = {
        generatedAt: new Date().toISOString(),
        symptoms,
        analysis: payload,
        specialty: deriveSpecialtySearch(payload),
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `herb-diagnosis-${caseId}`,
          JSON.stringify(storagePayload)
        );
      }

      router.push(`/diagnosis/result?case=${caseId}`);
      return payload;
    },
    [router, toBase64]
  );

  return (
    <main className="py-16">
      <div className="page-shell space-y-16">
        <header className="space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            AI diagnosis
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Tell Herb what’s going on
            </h1>
            <p className="text-lg text-muted">
              Describe how you feel, add any photos, and Herb will analyze your
              symptoms using Google Gemini to surface possible conditions,
              emergency guidance, and the right level of care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted lg:justify-start">
              <span className="rounded-full bg-white/5 px-3 py-1">
                ✦ Takes under 2 minutes
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                ✦ Works with images + text
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                ✦ Flags emergencies automatically
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-12 lg:grid-cols-[1fr_0.65fr]">
          <DiagnosisForm onSubmit={handleSubmit} />

          <aside className="glass-card flex h-fit flex-col gap-6 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-white">
              What to expect
            </h2>
            <p className="text-sm text-muted">
              Herb combines your description with visual analysis to produce a
              tailored health brief. Keep your phone nearby—we’ll notify you as
              soon as the results are ready.
            </p>

            <ul className="space-y-5">
              {benefits.map(({ title, description }) => (
                <li
                  key={title}
                  className="rounded-3xl border border-white/5 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{description}</p>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-xs text-emerald-100">
              Herb helps you understand what might be happening, but it’s not a
              substitute for professional medical advice. Always call emergency
              services if you need immediate help.
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <Link href="/map" className="btn-secondary">
                Find nearby care
              </Link>
              <Link href="/" className="btn-secondary">
                Back to dashboard
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default DiagnosisPage;
