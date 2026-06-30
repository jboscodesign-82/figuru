import { useRef, useState, useCallback } from 'react'
import Tesseract from 'tesseract.js'

export default function useOCR() {
  const workerRef = useRef(null)
  const [loading,   setLoading]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)

  const recognize = useCallback(async (imageSource) => {
    setLoading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      if (!workerRef.current) {
        workerRef.current = await Tesseract.createWorker('eng', 1, {
          logger: ({ progress: p }) => setProgress(Math.round(p * 100)),
        })
      }

      const { data } = await workerRef.current.recognize(imageSource)
      setResult(data.text)
      return data.text
    } catch (e) {
      setError(e.message || 'Erro no OCR')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const terminate = useCallback(async () => {
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return { recognize, terminate, loading, progress, result, error }
}
