import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/spine_logo.svg'

export default function TopNav() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="header-left">
          <Link to="/" className="brand" aria-label="Spinova home">
            <span className="brand-mark">
              <img src={logo} alt="Spinova logo" />
            </span>
          </Link>
        </div>

        <div className="header-center">
          <div className="site-ribbon">CLINICAL DECISION SUPPORT · LUMBAR SPINE</div>
        </div>

        <div className="header-right">
          <nav className="home-nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              About
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              How it works
            </NavLink>
            <Link to="/signin" className="btn-primary">Sign in</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
