import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  // key={pathname} forces React to remount on route change, which restarts
  // the CSS animation below — that's what makes each page transition feel
  // deliberate instead of an instant cut.
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}
