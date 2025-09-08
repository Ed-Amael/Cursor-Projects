import { NavLink, Outlet, Link } from 'react-router-dom';
import './global.css';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">AuraSAT</Link>
          <nav className="nav">
            <NavLink to="/plans">Plans</NavLink>
            <NavLink to="/coverage">Coverage</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/support">Support</NavLink>
            <NavLink to="/faqs">FAQs</NavLink>
            <NavLink to="/speed-test">Speed Test</NavLink>
            <NavLink to="/account" className="cta">Account</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} AuraSAT. Connecting rural communities.</p>
        </div>
      </footer>
    </div>
  );
}