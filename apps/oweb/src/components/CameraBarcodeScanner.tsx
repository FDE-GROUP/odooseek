declare class BarcodeDetector {
  constructor(options?: { formats: string[] })
  static getSupportedFormats(): Promise<string[]>
  getSupportedFormats(): Promise<string[]>
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string }>>
}

import { useEffect, useRef, useState } from 'react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onError?: (error: string) => void
}

export function CameraBarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const lastScannedRef = useRef<string>('')
  const scanCooldownRef = useRef<number>(0)

  const startCamera = async () => {
    setStatus('starting')
    setErrorMsg(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('scanning')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied'
      setErrorMsg(msg)
      setStatus('error')
      onError?.(msg)
    }
  }

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('idle')
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (status !== 'scanning' || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let detector: BarcodeDetector | null = null

    try {
      if ('BarcodeDetector' in window) {
        detector = new BarcodeDetector({
          formats: [
            'qr_code',
            'code_128',
            'code_39',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'codabar',
          ],
        })
      }
    } catch {
      /* BarcodeDetector not available */
    }

    const scan = async () => {
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        if (detector) {
          const barcodes = await detector.detect(canvas)
          if (barcodes.length > 0 && scanCooldownRef.current <= 0) {
            const value = barcodes[0].rawValue
            if (value && value !== lastScannedRef.current) {
              lastScannedRef.current = value
              scanCooldownRef.current = 30
              onScan(value)
            }
          }
        }
        if (scanCooldownRef.current > 0) {
          scanCooldownRef.current -= 1
        }
      } catch {
        /* detection error, continue */
      }

      rafRef.current = requestAnimationFrame(scan)
    }

    rafRef.current = requestAnimationFrame(scan)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [status, onScan])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === 'scanning'
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900'
              : 'bg-accent text-white hover:opacity-90'
          }`}
          onClick={status === 'scanning' ? stopCamera : startCamera}
          disabled={status === 'starting'}
        >
          {status === 'starting'
            ? 'Starting camera...'
            : status === 'scanning'
              ? 'Stop Camera'
              : 'Camera Scan'}
        </button>
        {status === 'scanning' && (
          <span className="text-xs text-muted-foreground">Point at barcode</span>
        )}
        {errorMsg && <span className="text-xs text-red-500">{errorMsg}</span>}
      </div>

      {status === 'scanning' && (
        <div className="relative overflow-hidden rounded-lg border dark:border-gray-700">
          <video ref={videoRef} className="w-full rounded-lg" playsInline muted autoPlay />
          <div className="absolute inset-0 border-2 border-accent/50 rounded-lg pointer-events-none">
            <div className="absolute left-1/2 top-1/2 h-1 w-3/4 -translate-x-1/2 -translate-y-1/2 border border-accent/30" />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
