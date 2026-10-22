import { Link, useLocation } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HomeFab() {
  const { pathname } = useLocation()
  if (pathname === '/') return null

  return (
    <Link to="/" className="home-fab" aria-label="Return to home page" title="Home">
      <HomeIcon />
      <span>Home</span>
    </Link>
  )
}
