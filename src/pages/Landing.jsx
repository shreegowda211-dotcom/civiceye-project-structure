import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const roles = [
  {
    title: "Citizens",
    description: "Report issues, track status, and give feedback.",
    points: [
      "Report new issues",
      "Track complaint status",
      "View resolution timeline",
      "Rate service quality",
    ],
  },
  {
    title: "Department Officers",
    description: "Handle assigned issues and update progress.",
    points: [
      "View assigned issues",
      "Update issue status",
      "Add resolution notes",
      "Manage workload",
    ],
  },
  {
    title: "Administrators",
    description: "Monitor system performance and governance.",
    points: [
      "Analytics dashboard",
      "Assign issues",
      "Manage departments",
      "Generate reports",
    ],
  },
];

const features = [
  {
    title: "Easy Issue Reporting",
    description:
      "Report civic issues like potholes, garbage, and streetlights with photos and location.",
  },
  {
    title: "GPS Location",
    description:
      "Automatic location detection with map integration for accuracy.",
  },
  {
    title: "Real-time Tracking",
    description:
      "Track your complaint status from submission to resolution.",
  },
  {
    title: "Transparency Dashboard",
    description:
      "View department performance and resolution statistics.",
  },
];

const steps = [
  { title: "Report", description: "Submit issue with photo & location" },
  { title: "Assign", description: "Auto-routed to department" },
  { title: "Track", description: "Monitor progress in real-time" },
  { title: "Resolve", description: "Get notified when fixed" },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">

        {/* HERO */}
        <section className="relative bg-gradient-to-br from-sky-700 via-sky-600 to-indigo-700 text-white">
          <div className="w-full px-10 py-16 text-center animate-fade-in">
            <p className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide backdrop-blur">
              Government of India Initiative
            </p>

            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">
              CivicEye
            </h1>

            <p className="mt-3 text-lg text-sky-100">
              Smart Public Issue Reporting & Resolution System
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-sky-100/80">
              Report civic issues, track resolutions, and build better cities
              through transparent governance.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slide-up">
              <Link
                to="/register"
                className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-100"
              >
                Report an Issue
              </Link>

              <Link
                to="/login"
                className="rounded-md border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="w-full py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <h2 className="text-center text-2xl font-semibold" style={{color : "#0f273b"}} >
            How CivicEye Works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 duration-300"
              >
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="bg-slate-100/60">
          <div className="mx-auto max-w-screen-xl px-6 py-16">
            <h2 className="text-center text-3xl font-bold text-slate-800" style={{color : "#0f273b"}}>
              Simple 4-Step Process
            </h2>

            <div className="relative mt-12 grid gap-8 md:grid-cols-4">

  {/* Connecting Line */}
  <div
    className="absolute left-0 right-0 hidden md:block"
    style={{ top: "1.75rem" }}
  >
    <div className="px-10">
      <div className="h-0.5 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500"></div>
    </div>
  </div>

  {steps.map((step, i) => (
    <div
      key={step.title}
      className="relative z-10 rounded-xl bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 duration-300"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center 
                      rounded-full bg-sky-600 text-white font-bold text-lg 
                      shadow-md ring-4 ring-white">
        {i + 1}
      </div>

      <h3 className="mt-5 text-base font-semibold text-slate-800">
        {step.title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {step.description}
      </p>
    </div>
  ))}
</div>
          </div>
        </section>

        {/* ROLES */}
        <section className="mx-auto max-w-screen-xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold" style={{color : "#0f273b"}} >
            For Everyone
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="group rounded-xl bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 duration-300"
              >
                <h3 className="text-base font-semibold">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {role.description}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {role.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-sky-800 text-white">
          <div className="mx-auto max-w-screen-xl px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold">
              Ready to Make a Difference?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-sky-100">
              Join thousands of citizens in building better cities with
              transparency and accountability.
            </p>

            <Link
              to="/register"
              className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-100"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
