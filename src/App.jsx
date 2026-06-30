import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Collection from './pages/Collection'
import Missing from './pages/Missing'
import Scanner from './pages/Scanner'
import Settings from './pages/Settings'
import styles from './App.module.css'

const NAV = [
  { to: '/',          icon: '📚', label: 'Coleção'  },
  { to: '/faltando',  icon: '🔍', label: 'Faltando' },
  { to: '/scanner',   icon: '📷', label: 'Scanner'  },
  { to: '/config',    icon: '⚙️',  label: 'Config'   },
]

export default function App() {
  return (
    <BrowserRouter basename="/figuru">
      <div className={styles.layout}>
        <main className={styles.main}>
          <Routes>
            <Route path="/"         element={<Collection />} />
            <Route path="/faltando" element={<Missing />} />
            <Route path="/scanner"  element={<Scanner />} />
            <Route path="/config"   element={<Settings />} />
          </Routes>
        </main>
        <nav className={styles.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  )
}
