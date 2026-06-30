import { useState } from 'react'
import { stickers, teams } from '../data/stickers'
import useCollection from '../store/useCollection'
import styles from './Missing.module.css'

export default function Missing() {
  const { owned, toggle } = useCollection()
  const [filter, setFilter] = useState('ALL')

  const missing = stickers.filter(s =>
    !owned[s.code] && (filter === 'ALL' || s.teamCode === filter)
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Faltando</h1>
        <p className={styles.subtitle}>{missing.length} figurinhas</p>
      </header>

      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${filter === 'ALL' ? styles.chipActive : ''}`}
          onClick={() => setFilter('ALL')}
        >
          Todas
        </button>
        {teams.map(t => (
          <button
            key={t.code}
            className={`${styles.chip} ${filter === t.code ? styles.chipActive : ''}`}
            onClick={() => setFilter(t.code)}
          >
            {t.flag} {t.code}
          </button>
        ))}
      </div>

      {missing.length === 0 ? (
        <div className={styles.done}>
          <span>🏆</span>
          <p>Coleção completa!</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {missing.map(s => (
            <li key={s.id} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.code}>{s.code}</span>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.meta}>{s.team} · {s.position} · #{s.number}</span>
              </div>
              <button className={styles.got} onClick={() => toggle(s.code)}>
                Tenho!
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
