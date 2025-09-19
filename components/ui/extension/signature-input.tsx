'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from 'web-utils-components/button'
import { Eraser } from 'lucide-react'

type SignatureInputProps = {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
  onSignatureChange: (signature: string | null) => void
}

// const disableTouchScroll = (canvas: HTMLCanvasElement) => {
//   const preventScroll = (e: TouchEvent) => {
//     e.preventDefault() // Disable scroll
//   }

//   canvas.addEventListener('touchstart', preventScroll, { passive: false })
//   canvas.addEventListener('touchmove', preventScroll, { passive: false })
//   canvas.addEventListener('touchend', preventScroll, { passive: false })

//   return () => {
//     canvas.removeEventListener('touchstart', preventScroll)
//     canvas.removeEventListener('touchmove', preventScroll)
//     canvas.removeEventListener('touchend', preventScroll)
//   }
// }

// const SCALE = 10

export default function SignatureInput({
  canvasRef: externalCanvasRef,
  onSignatureChange,
}: SignatureInputProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Array<{ x: number; y: number; pressure: number }>>([])
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number }>>([])
  const [lastTimestamp, setLastTimestamp] = useState<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateStrokeColor = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const isDarkClass = document.documentElement.classList.contains('dark')
      const isLightClass = document.documentElement.classList.contains('light')

      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches

      const isDarkMode = isDarkClass || (!isLightClass && systemPrefersDark)

      // Industry-standard smooth drawing configuration
      ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = 'source-over'
      ctx.imageSmoothingEnabled = true
      // Enhanced smoothing for better quality
      if ('imageSmoothingQuality' in ctx) {
        ctx.imageSmoothingQuality = 'high'
      }
      // Optimize for drawing performance
      ctx.globalAlpha = 1.0
    }

    updateStrokeColor()

    const observer = new MutationObserver(updateStrokeColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateStrokeColor)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', updateStrokeColor)
    }
  }, [canvasRef])

  // Industry-standard smoothing algorithms
  const getPointPressure = (e: any, timestamp: number): number => {
    // Simulate pressure based on speed for non-pressure sensitive devices
    if (lastTimestamp && timestamp - lastTimestamp > 0) {
      const timeDiff = timestamp - lastTimestamp
      // Lower time diff = faster movement = higher pressure
      const pressure = Math.max(0.3, Math.min(1.0, 1.0 - (timeDiff - 5) / 20))
      return pressure
    }
    return 0.7 // Default pressure
  }

  const smoothPoints = (points: Array<{ x: number; y: number; pressure: number }>) => {
    if (points.length < 3) return points
    
    const smoothed = [points[0]]
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]
      
      // Catmull-Rom spline smoothing
      const smoothedPoint = {
        x: (prev.x + 2 * curr.x + next.x) / 4,
        y: (prev.y + 2 * curr.y + next.y) / 4,
        pressure: (prev.pressure + 2 * curr.pressure + next.pressure) / 4
      }
      smoothed.push(smoothedPoint)
    }
    
    smoothed.push(points[points.length - 1])
    return smoothed
  }

  const drawStroke = (ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number; pressure: number }>) => {
    if (points.length < 2) return

    const smoothedPoints = smoothPoints(points)
    
    for (let i = 1; i < smoothedPoints.length; i++) {
      const prev = smoothedPoints[i - 1]
      const curr = smoothedPoints[i]
      
      // Variable line width based on pressure
      const avgPressure = (prev.pressure + curr.pressure) / 2
      const lineWidth = 1 + avgPressure * 2.5 // Range: 1-3.5px
      
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)
      ctx.stroke()
    }
  }

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault()
    setIsDrawing(true)
    setCurrentStroke([])
    
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
      const timestamp = Date.now()
      const pressure = getPointPressure(e, timestamp)
      
      const newPoint = { x, y, pressure }
      setCurrentStroke([newPoint])
      setLastTimestamp(timestamp)
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx && currentStroke.length > 0) {
      // Add current stroke to all points
      setPoints(prev => [...prev, ...currentStroke])
      setCurrentStroke([])
      
      // Always generate signature data when there are any strokes
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Signature captured:', dataUrl.substring(0, 50) + '...') // Debug log
      onSignatureChange(dataUrl)
    } else if (canvas && ctx) {
      // Even if currentStroke is empty, check if there's anything on canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasDrawing = imageData.data.some((pixel, index) => {
        // Check alpha channel (every 4th value)
        return index % 4 === 3 && pixel > 0
      })
      
      if (hasDrawing) {
        const dataUrl = canvas.toDataURL('image/png')
        console.log('Signature captured (fallback):', dataUrl.substring(0, 50) + '...') // Debug log
        onSignatureChange(dataUrl)
      }
    }
  }

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
      const timestamp = Date.now()
      const pressure = getPointPressure(e, timestamp)

      const newPoint = { x, y, pressure }
      const updatedStroke = [...currentStroke, newPoint]
      setCurrentStroke(updatedStroke)
      setLastTimestamp(timestamp)

      // Real-time drawing with industry-standard smoothing
      if (updatedStroke.length >= 2) {
        const lastTwoPoints = updatedStroke.slice(-2)
        drawStroke(ctx, lastTwoPoints)
      }
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setPoints([])
      setCurrentStroke([])
      onSignatureChange(null)
    }
  }

  // Add method to manually capture signature (useful for debugging)
  const captureSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Manual signature capture:', dataUrl.substring(0, 50) + '...')
      onSignatureChange(dataUrl)
      return dataUrl
    }
    return null
  }

  // Expose captureSignature method via useEffect for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).captureSignature = captureSignature
    }
  }, [])

  return (
    <div className="border border-border rounded-md overflow-hidden relative w-[400px] h-[200px] bg-background">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full h-full touch-none"
        style={{ touchAction: 'none' }} // Prevent scrolling on touch devices
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute left-1 bottom-1 z-10 rounded-full"
        onClick={clearSignature}
      >
        <Eraser className="w-4 h-4 text-muted-foreground hover:text-primary" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="absolute right-1 bottom-1 z-10 text-xs"
        onClick={captureSignature}
      >
        Save
      </Button>
    </div>
  )
}
