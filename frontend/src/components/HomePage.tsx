import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import TopNav from './TopNav'
import doctorReviewingMri from '../assets/doctor-reviewing-mri.jpg'

const STEPS = [
  { n: '01', title: 'Upload', text: 'Add the MRI.' },
  { n: '02', title: 'Mark levels', text: 'Click L1/L2–L5/S1.' },
  { n: '03', title: 'Review', text: 'Get a risk tier.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream text-navy">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-12">
        <TopNav />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <Reveal className="space-y-6" as="div">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-navy md:text-5xl">
                Screen lumbar spine MRIs for degenerative disease, level by level
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Spinova screens each disc level — L1/L2 through L5/S1 — for spinal canal stenosis, foraminal narrowing, subarticular stenosis, and disc degeneration, and gives you a risk tier in minutes. Built for district hospitals working with limited radiology coverage.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/signin"
                className="inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Sign in
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Learn about the disease
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft">
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">Clinical safety notice:</span> This tool supports review — it does not replace a radiologist’s read.
              </p>
            </div>
          </Reveal>

          <Reveal className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft lg:p-6" delay={120}>
            <div className="absolute inset-x-0 top-4 h-12 rounded-b-full bg-teal/10 blur-2xl" />
            <img
              src={doctorReviewingMri}
              alt="Radiologist pointing at lumbar spine MRI scans on a monitor"
              className="relative h-[380px] w-full rounded-[1.5rem] object-cover shadow-xl"
            />
          </Reveal>
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal">How it works</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Follow the clinician workflow with a clear progression from upload to level marking to risk review.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              See the full walkthrough →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.n} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-teal/40 hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-sm font-bold text-white">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="mt-5 h-0.5 w-full rounded-full bg-slate-200 group-hover:bg-teal/40" />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex justify-center border-t border-slate-200 pt-6 text-sm text-slate-500">
          Draft thresholds pending clinical review — not a diagnostic device.
        </div>
      </div>
    </main>
  )
}
