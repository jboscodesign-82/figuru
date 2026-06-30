import { useState } from 'react'
import { stickers, teams } from '../data/stickers'
import useCollection from '../store/useCollection'
import styles from './Collection.module.css'

export default function Collection() {
  const { owned, toggle, count } = useCollection()
  const [filter, setFilter] = useState('ALL')

  const total    = stickers.length
  const collected = count()

  const visible = stickers.filter(s =>
    filter === 'ALL' ? true : s.teamCode === filter
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Minha Coleção</h1>
        <p className={styles.subtitle}>
          {collected} / {total} figurinhas
        </p>
        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{ width: `${(collected / total) * 100}%` }}
          />
        </div>
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

      <div className={styles.grid}>
        {visible.map(s => (
          <button
            key={s.id}
            className={`${styles.card} ${owned[s.code] ? styles.owned : ''}`}
            onClick={() => toggle(s.code)}
            title={`${s.name} — ${s.team}`}
          >
            <span className={styles.code}>{s.code}</span>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.pos}>{s.position}</span>
            {owned[s.code] && <span className={styles.check}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
