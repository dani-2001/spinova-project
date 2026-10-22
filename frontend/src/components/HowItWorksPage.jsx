import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import TopNav from './TopNav'

const STEPS = [
  {
    n: '01',
    title: 'Upload the study',
    text: 'Add a lumbar spine MRI — a DICOM file or an exported image. Spinova checks it actually looks like a lumbar-spine scan before doing anything else, so an unrelated image gets flagged rather than scored.',
  },
  {
    n: '02',
    title: 'Mark the disc levels',
    text: 'Click each level from L1/L2 down to L5/S1 directly on the image. There is no automatic lesion-finder yet, so this quick manual step tells the model exactly where to look for each condition.',
  },
  {
    n: '03',
    title: 'Review the findings',
    text: 'Spinova screens every marked level for spinal canal stenosis, foraminal narrowing, and subarticular stenosis, then rolls the worst findings up into a single risk tier you can act on.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="home">
      <TopNav />

      <section className="home-section home-section-first">
        <Reveal as="div">
          <span className="home-eyebrow">How it works</span>
          <h2>From upload to risk tier in three steps</h2>
          <p className="home-section-lede">
            Spinova is built to support a clinician's read, not replace it —
            every step keeps a person in the loop.
          </p>
        </Reveal>

        <div className="steps-detail-list">
          {STEPS.map((s, i) => (
            <Reveal as="div" className="step-detail-card" key={s.n} delay={i * 90}>
              <span className="step-detail-n">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="home-cta-row" style={{ marginTop: '1rem' }}>
          <Link to="/signin" className="btn-primary" style={{ width: 'auto' }}>Sign in to try it</Link>
          <Link to="/about" className="btn-ghost">Learn about the disease</Link>
        </div>
      </section>

      <footer className="home-footer">
        <span>Spinova · lumbar spine screening</span>
        <span className="muted tiny">Draft thresholds pending clinical review — not a diagnostic device.</span>
      </footer>
    </div>
  )
}
