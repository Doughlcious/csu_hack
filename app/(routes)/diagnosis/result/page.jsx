"use client";

import MapComp from "@/components/MapComp";
import { deriveSpecialtySearch } from "@/lib/diagnosisSpecialties";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DiagnosisResultPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  const caseId = searchParams.get("case");

  useEffect(() => {
    let cancelled = false;

    const loadDiagnosis = async () => {
      await Promise.resolve();

      if (!caseId) {
        if (!cancelled) {
          setError(
            "We couldn’t find that diagnosis session. Please start a new assessment."
          );
        }
        return;
      }

      const key = `herb-diagnosis-${caseId}`;

      try {
        const stored =
          typeof window !== "undefined" ? sessionStorage.getItem(key) : null;

        if (!stored) {
          if (!cancelled) {
            setError(
              "That diagnosis session expired. Please start a new assessment."
            );
          }
          return;
        }

        const parsed = JSON.parse(stored);

        if (!parsed?.analysis) {
          if (!cancelled) {
            setError(
              "We couldn’t load those results. Please start a new assessment."
            );
          }
          return;
        }

        const specialty =
          parsed.specialty || deriveSpecialtySearch(parsed.analysis);

        if (!cancelled) {
          setPayload({
            ...parsed,
            specialty,
          });
          setError("");
        }
      } catch (err) {
        console.error("Failed to load diagnosis payload:", err);
        if (!cancelled) {
          setError(
            "Something went wrong loading your results. Please try again."
          );
        }
      }
    };

    loadDiagnosis();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const analysis = payload?.analysis;
  const specialty = payload?.specialty;

  const formattedTimestamp = payload?.generatedAt
    ? new Date(payload.generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  if (error) {
    return (
      <main className="py-16">
        <div className="page-shell space-y-10 text-center">
          <div className="glass-card mx-auto flex max-w-xl flex-col gap-4 rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white">
              Diagnosis unavailable
            </h1>
            <p className="text-sm text-muted">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/diagnosis" className="btn-primary">
                Start a new diagnosis
              </Link>
              <Link href="/" className="btn-secondary">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="py-16">
        <div className="page-shell">
          <div className="glass-card rounded-3xl p-8 text-center text-sm text-muted">
            Retrieving your results…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-16">
      <div className="page-shell space-y-16">
        <header className="space-y-4 text-center lg:text-left">
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            Diagnosis results
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Here’s what Herb found
            </h1>
            <p className="text-lg text-muted">
              Review the analysis, follow the recommended next steps, and find
              nearby care matched to your condition.
            </p>
            {formattedTimestamp && (
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Generated {formattedTimestamp}
              </p>
            )}
          </div>
        </header>

        <section className="glass-card space-y-6 rounded-3xl p-8">
          {analysis.emergency ? (
            <div className="rounded-3xl border border-rose-500/50 bg-rose-500/10 p-5 text-sm text-rose-100">
              <p className="font-semibold text-white">
                Emergency attention recommended
              </p>
              <p className="mt-2 text-sm text-rose-100">
                {analysis.emergencyReason}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm text-emerald-100">
              <p className="font-semibold text-white">
                Emergency unlikely right now
              </p>
              <p className="mt-2 text-sm text-emerald-100">
                {analysis.emergencyReason}
              </p>
            </div>
          )}

          {payload?.symptoms && (
            <div className="space-y-2 rounded-3xl border border-white/5 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                What you shared
              </p>
              <p className="text-sm text-muted whitespace-pre-line">
                {payload.symptoms}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Herb’s summary</h2>
            <p className="text-sm text-muted">{analysis.summary}</p>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Likely conditions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(analysis.conditions ?? []).map((condition) => (
                <article
                  key={condition.name}
                  className="rounded-3xl border border-white/5 bg-white/5 p-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">
                    {condition.probability}
                  </p>
                  <h4 className="mt-1 text-xl font-semibold text-white">
                    {condition.name}
                  </h4>
                  <p className="mt-2 text-sm text-muted">
                    {condition.description}
                  </p>
                  {!!condition.recommendedActions?.length && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                        Suggested actions
                      </p>
                      <ul className="space-y-2 text-sm text-muted">
                        {condition.recommendedActions.map((action) => (
                          <li key={action} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!condition.medications?.length && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                        Medications
                      </p>
                      <ul className="space-y-2 text-sm text-muted">
                        {condition.medications.map((med) => (
                          <li key={med} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                            <span>{med}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!condition.preventionTips?.length && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                        Prevention tips
                      </p>
                      <ul className="space-y-2 text-sm text-muted">
                        {condition.preventionTips.map((tip) => (
                          <li key={tip} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-white/5 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">
                Recommended care level
              </h3>
              <p className="text-sm text-muted">
                {analysis.recommendedCareLevel}
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/5 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">Follow up</h3>
              <p className="text-sm text-muted">{analysis.followUp}</p>
            </div>
          </div>

          {!!analysis.selfCareTips?.length && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Supportive self-care
              </h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {analysis.selfCareTips.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-3xl border border-white/5 bg-white/5 p-4 text-sm text-muted"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {specialty && (
          <section className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">
                Specialist care nearby
              </h2>
              <p className="text-sm text-muted">
                {analysis.emergency
                  ? "We’re highlighting emergency departments close to you so you can get help right away."
                  : `We prioritized ${specialty.label.toLowerCase()} based on Herb’s analysis.`}
              </p>
            </div>
            <MapComp
              keyword={specialty.keyword}
              placeType={specialty.placeType}
              radius={specialty.radius ?? 7000}
              title={specialty.label}
              highlight={specialty.note}
            />
          </section>
        )}

        <footer className="glass-card flex flex-col items-center gap-4 rounded-3xl p-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Need a different opinion or update?
            </h2>
            <p className="text-sm text-muted">
              Share how you feel again or explore specialists to keep moving
              forward with confidence.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/diagnosis" className="btn-primary">
              Start a new diagnosis
            </Link>
            <Link href="/map" className="btn-secondary">
              Browse all nearby care
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default DiagnosisResultPage;
