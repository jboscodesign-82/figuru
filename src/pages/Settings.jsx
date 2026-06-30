import { stickers } from '../data/stickers'
import useCollection from '../store/useCollection'
import styles from './Settings.module.css'

export default function Settings() {
  const { owned, reset, count } = useCollection()
  const total     = stickers.length
  const collected = count()

  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      collected,
      total,
      owned: Object.keys(owned),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'figuru-colecao.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (window.confirm('Apagar toda a coleção? Esta ação não pode ser desfeita.')) {
      reset()
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configurações</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Progresso</h2>
        <div className={styles.stat}>
          <span className={styles.statValue}>{collected}</span>
          <span className={styles.statLabel}>de {total} figurinhas</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {total > 0 ? Math.round((collected / total) * 100) : 0}%
          </span>
          <span className={styles.statLabel}>completo</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dados</h2>
        <button className={styles.btn} onClick={handleExport}>
          Exportar coleção (.json)
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Perigo</h2>
        <button className={`${styles.btn} ${styles.danger}`} onClick={handleReset}>
          Apagar coleção
        </button>
      </section>

      <p className={styles.version}>Figuru v0.1.0 · Copa 2026</p>
    </div>
  )
}
