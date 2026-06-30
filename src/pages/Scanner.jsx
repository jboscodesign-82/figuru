import { useEffect, useState } from 'react'
import useCamera from '../hooks/useCamera'
import useOCR from '../hooks/useOCR'
import { parseSticker } from '../utils/parseSticker'
import useCollection from '../store/useCollection'
import styles from './Scanner.module.css'

export default function Scanner() {
  const { videoRef, active, error: camErr, start, stop, capture } = useCamera()
  const { recognize, loading, progress, error: ocrErr }           = useOCR()
  const { owned, markMany } = useCollection()

  const [found,   setFound]   = useState([])
  const [newOnes, setNewOnes] = useState([])

  useEffect(() => () => stop(), [stop])

  async function handleScan() {
    const canvas = capture()
    if (!canvas) return
    const text = await recognize(canvas)
    const codes = parseSticker(text)
    setFound(codes)
    const fresh = codes.filter(c => !owned[c])
    setNewOnes(fresh)
    if (fresh.length) markMany(fresh)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Scanner OCR</h1>

      <div className={styles.viewfinder}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
        />
        {!active && (
          <div className={styles.overlay}>
            <span>📷</span>
            <p>Câmera inativa</p>
          </div>
        )}
      </div>

      {(camErr || ocrErr) && (
        <p className={styles.error}>{camErr || ocrErr}</p>
      )}

      <div className={styles.actions}>
        {!active ? (
          <button className={styles.btn} onClick={start}>Ligar câmera</button>
        ) : (
          <>
            <button className={styles.btnSecondary} onClick={stop}>Desligar</button>
            <button className={styles.btn} onClick={handleScan} disabled={loading}>
              {loading ? `OCR… ${progress}%` : 'Escanear'}
            </button>
          </>
        )}
      </div>

      {found.length > 0 && (
        <div className={styles.result}>
          <p className={styles.resultTitle}>
            {newOnes.length > 0
              ? `✅ ${newOnes.length} nova(s) marcada(s)!`
              : 'Todas já estavam na coleção'}
          </p>
          <div className={styles.codes}>
            {found.map(c => (
              <span key={c} className={`${styles.codeTag} ${newOnes.includes(c) ? styles.new : ''}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className={styles.hint}>
        Aponte a câmera para o código da figurinha (ex: BRA001) e toque em Escanear.
      </p>
    </div>
  )
}
