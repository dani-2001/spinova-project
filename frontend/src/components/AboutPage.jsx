import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import TopNav from './TopNav'
import spineModelTeaching from '../assets/spine-model-teaching.jpg'

const CONDITIONS = [
  {
    name: 'Spinal canal stenosis',
    blurb: 'The central canal narrows and can crowd the spinal cord or cauda equina, often causing leg heaviness or pain when walking.',
  },
  {
    name: 'Neural foraminal narrowing',
    blurb: 'The side openings where nerve roots exit the spine narrow, which can pinch a nerve and send pain down one leg.',
  },
  {
    name: 'Subarticular stenosis',
    blurb: 'Narrowing near the base of the nerve root, in the lateral recess just off the canal — a common source of sciatica.',
  },
  {
    name: 'Disc degeneration & herniation',
    blurb: 'The cushioning disc between vertebrae wears down or bulges, which can irritate nearby nerves and reduce mobility.',
  },
]

export default function AboutPage() {
  return (
    <div className="home">
      <TopNav />

      <section className="home-section home-section-first">
        <div className="home-overview-grid">
          <Reveal as="div">
            <span className="home-eyebrow">Overview</span>
            <h2>What is lumbar spine degenerative disease?</h2>
            <p className="home-section-lede">
              As the lower spine ages, the discs, joints, and canals around the
              five lumbar levels (L1 to S1) can narrow or wear down — one of
              the most common causes of lower back pain and sciatica
              worldwide. It usually shows up as one or more of these patterns
              on MRI:
            </p>
            <div className="condition-grid">
              {CONDITIONS.map((c, i) => (
                <Reveal as="div" className="condition-card" key={c.name} delay={i * 60}>
                  <h3>{c.name}</h3>
                  <p>{c.blurb}</p>
                </Reveal>
              ))}
            </div>
            <div className="home-cta-row" style={{ marginTop: '2rem' }}>
              <Link to="/how-it-works" className="btn-primary" style={{ width: 'auto' }}>See how screening works</Link>
              <Link to="/signin" className="btn-ghost">Sign in</Link>
            </div>
          </Reveal>
          <Reveal className="home-overview-art" delay={150}>
            <img
              src={spineModelTeaching}
              alt="Clinician pointing to disc levels on a lumbar spine model"
              className="home-photo"
            />
          </Reveal>
        </div>
      </section>

      <footer className="home-footer">
        <span>Spinova · lumbar spine screening</span>
        <span className="muted tiny">Draft thresholds pending clinical review — not a diagnostic device.</span>
      </footer>
    </div>
  )
}
