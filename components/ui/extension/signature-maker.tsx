"use client"

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'web-utils-components/button'
import { Input } from 'web-utils-components/input'
import { cn } from 'web-utils-common'
import { 
  Pen, 
  Type, 
  Upload, 
  Undo2, 
  Eraser,
  X
} from 'lucide-react'

// Type definitions
export interface SignatureMakerRef {
  getSignature: () => string | null
  clear: () => void
  undo: () => void
  isEmpty: () => boolean
}

export interface SignatureMakerProps {
  className?: string
  disabled?: boolean
  onSave?: (signature: string) => void
  onChange?: (signature: string | null) => void
  withSubmit?: boolean
  withTyped?: boolean
  withDrawn?: boolean
  withUpload?: boolean
  downloadOnSave?: boolean
  placeholder?: string
  saveButtonText?: string
}

type SignatureType = 'draw' | 'type' | 'upload'

interface Point {
  x: number
  y: number
  pressure?: number
}

const SignatureMaker = forwardRef<SignatureMakerRef, SignatureMakerProps>(({
  className,
  disabled = false,
  onSave,
  onChange,
  withSubmit = true,
  withTyped = true,
  withDrawn = true,
  withUpload = true,
  downloadOnSave = false,
  placeholder = "Type your signature here",
  saveButtonText = "Save Signature"
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [signatureType, setSignatureType] = useState<SignatureType>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Array<Array<{x: number, y: number, pressure?: number}>>>([])
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number, pressure?: number}>>([])

  // Available signature types based on props
  const availableTypes = [
    ...(withDrawn ? [{ type: 'draw' as const, icon: Pen, label: "Draw" }] : []),
    ...(withTyped ? [{ type: 'type' as const, icon: Type, label: "Type" }] : []),
    ...(withUpload ? [{ type: 'upload' as const, icon: Upload, label: "Upload" }] : [])
  ]

  // Set default type to first available
  useEffect(() => {
    if (availableTypes.length > 0 && !availableTypes.find(t => t.type === signatureType)) {
      setSignatureType(availableTypes[0].type)
    }
  }, [withDrawn, withTyped, withUpload])

  // Canvas drawing functions with pen-like smoothing
  const getCanvasContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Store current canvas state
    const imageData = canvas.toDataURL()
    const currentStrokes = [...strokes]

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Set actual canvas size (accounting for device pixel ratio)
    canvas.width = rect.width * dpr
    canvas.height = 250 * dpr
    
    // Set display size (CSS pixels)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = '250px'
    
    const ctx = getCanvasContext()
    if (ctx) {
      // Scale the canvas for high DPI displays
      ctx.scale(dpr, dpr)
      
      // Set drawing properties
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Set theme-appropriate colors
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000'
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff'
      
      // Fill background
      ctx.fillRect(0, 0, rect.width, 250)
      
      // Restore strokes if they exist
      if (currentStrokes.length > 0) {
        setStrokes(currentStrokes)
        redrawCanvas()
      }
    }
  }

  const redrawCanvas = () => {
    const ctx = getCanvasContext()
    if (!ctx) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    // Get current dimensions considering device pixel ratio
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Set background based on current theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff'
    ctx.fillRect(0, 0, rect.width, 250)
    
    // Draw with appropriate pen color
    ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    strokes.forEach(stroke => {
      if (stroke.length > 1) {
        stroke.forEach((point, index) => {
          if (index > 0) {
            const prevPoint = stroke[index - 1]
            const currentPoint = point
            
            // Calculate pen-like variable width
            const distance = Math.sqrt(
              Math.pow(currentPoint.x - prevPoint.x, 2) + 
              Math.pow(currentPoint.y - prevPoint.y, 2)
            )
            const baseWidth = 2
            const maxWidth = 5
            const speed = Math.min(distance, 25)
            const width = Math.max(baseWidth, maxWidth - (speed / 25) * (maxWidth - baseWidth))
            
            ctx.lineWidth = width
            ctx.beginPath()
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(currentPoint.x, currentPoint.y)
            ctx.stroke()
          }
        })
      }
    })
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  // Drawing event handlers
  const startDrawing = (point: { x: number, y: number }) => {
    setIsDrawing(true)
    setCurrentStroke([{ ...point, pressure: 1 }])
  }

  const draw = (point: { x: number, y: number }) => {
    if (!isDrawing) return
    
    const newPoint = { ...point, pressure: 1 }
    const newStroke = [...currentStroke, newPoint]
    setCurrentStroke(newStroke)
    
    const ctx = getCanvasContext()
    if (ctx && currentStroke.length > 0) {
      // Draw smooth pen-like stroke
      drawSmoothLine(ctx, currentStroke[currentStroke.length - 1], newPoint)
    }
  }

  const drawSmoothLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number; pressure?: number }, to: { x: number; y: number; pressure?: number }) => {
    // Calculate variable stroke width based on speed (simulating pressure)
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
    const baseWidth = 2
    const maxWidth = 5
    const speed = Math.min(distance, 25) // Cap speed
    
    // Slower drawing = thicker stroke (pen pressure effect)
    const width = Math.max(baseWidth, maxWidth - (speed / 25) * (maxWidth - baseWidth))
    
    // Use appropriate pen color based on current theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000'
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke])
      setCurrentStroke([])
      handleChange()
    }
    setIsDrawing(false)
  }

  // Get signature data
  const getSignatureData = (): string | null => {
    if (signatureType === 'type') {
      if (!typedSignature.trim()) return null
      
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#1e293b'
        ctx.font = '32px cursive'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)
      }
      
      return canvas.toDataURL()
    } else if (signatureType === 'draw') {
      const canvas = canvasRef.current
      if (!canvas || strokes.length === 0) return null
      return canvas.toDataURL()
    }
    
    return null
  }

  const isEmpty = (): boolean => {
    if (signatureType === 'type') return !typedSignature.trim()
    if (signatureType === 'draw') return strokes.length === 0
    return true
  }

  const handleChange = () => {
    const signature = getSignatureData()
    onChange?.(signature)
  }

  const handleSave = () => {
    const signature = getSignatureData()
    if (!signature) return
    
    onSave?.(signature)
    
    if (downloadOnSave) {
      const link = document.createElement('a')
      link.download = 'signature.png'
      link.href = signature
      link.click()
    }
  }

  const handleClear = () => {
    if (signatureType === 'type') {
      setTypedSignature('')
    } else if (signatureType === 'draw') {
      setStrokes([])
      setCurrentStroke([])
      const ctx = getCanvasContext()
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }
    }
    handleChange()
  }

  const handleUndo = () => {
    if (signatureType === 'draw' && strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1))
      handleChange()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = getCanvasContext()
        if (!canvas || !ctx) return
        
        // Get canvas dimensions
        const rect = canvas.getBoundingClientRect()
        
        // Set proper background first
        const isDarkMode = document.documentElement.classList.contains('dark')
        ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff'
        ctx.fillRect(0, 0, rect.width, 250)

        // Calculate aspect ratio and center the image
        const canvasAspect = rect.width / 250
        const imageAspect = img.width / img.height
        
        let drawWidth, drawHeight, drawX, drawY
        
        if (imageAspect > canvasAspect) {
          // Image is wider than canvas
          drawWidth = rect.width
          drawHeight = rect.width / imageAspect
          drawX = 0
          drawY = (250 - drawHeight) / 2
        } else {
          // Image is taller than canvas
          drawHeight = 250
          drawWidth = 250 * imageAspect
          drawX = (rect.width - drawWidth) / 2
          drawY = 0
        }

        // Clear any existing strokes when uploading
        setStrokes([])
        setCurrentStroke([])

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        handleChange()
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getSignature: getSignatureData,
    clear: handleClear,
    undo: handleUndo,
    isEmpty
  }))

  // Effects
  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          redrawCanvas()
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (signatureType === 'draw') {
      redrawCanvas()
    }
  }, [strokes])

  useEffect(() => {
    if (signatureType === 'type') {
      handleChange()
    }
  }, [typedSignature])

  return (
    <div className={cn("w-full relative", disabled && "opacity-50 cursor-not-allowed", className)}>
      {/* Main Signature Box */}
      <div ref={containerRef} className="relative group">
        {/* Mode Selection - Top Left Corner */}
        {availableTypes.length > 1 && (
          <div className="absolute top-3 left-3 z-10 flex gap-1">
            {availableTypes.map(({ type, icon: Icon }) => (
              <Button
                key={type}
                type="button"
                variant={signatureType === type ? "default" : "ghost"}
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault()
                  if (!disabled) setSignatureType(type)
                }}
                className={cn(
                  "h-8 w-8 p-0 rounded-full border shadow-sm transition-colors",
                  signatureType === type 
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-primary dark:hover:bg-slate-200" 
                    : "bg-white/90 hover:bg-white text-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-300"
                )}
                title={type === 'draw' ? 'Draw' : type === 'type' ? 'Type' : 'Upload'}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}

        {/* Control Buttons - Bottom Left Corner */}
        <div className="absolute bottom-3 left-3 z-10 flex gap-1">
          {signatureType === 'draw' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || strokes.length === 0}
              onClick={(e) => {
                e.preventDefault()
                if (!disabled) handleUndo()
              }}
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white border shadow-sm text-slate-700 hover:text-primary disabled:opacity-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isEmpty()}
            onClick={(e) => {
              e.preventDefault()
              if (!disabled) handleClear()
            }}
            className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white border shadow-sm text-slate-700 hover:text-primary disabled:opacity-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
            title="Clear"
          >
            <Eraser className="h-4 w-4" />
          </Button>

          {withUpload && signatureType === 'upload' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault()
                if (!disabled) fileInputRef.current?.click()
              }}
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white border shadow-sm text-slate-700 hover:text-primary disabled:opacity-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              title="Upload Image"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Signature Input Area */}
        {signatureType === 'type' && (
          <div className="p-6">
            <Input
              type="text"
              placeholder={placeholder}
              value={typedSignature}
              disabled={disabled}
              onChange={(e) => !disabled && setTypedSignature(e.target.value)}
              className="text-2xl font-bold text-center h-[200px] bg-transparent border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200"
              style={{ fontFamily: 'cursive' }}
            />
          </div>
        )}

        {signatureType === 'draw' && (
          <div className="p-0">
            <canvas
              ref={canvasRef}
              className={cn(
                "w-full h-[250px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900",
                disabled ? "cursor-not-allowed" : "cursor-crosshair"
              )}
              onMouseDown={(e) => !disabled && startDrawing(getMousePos(e))}
              onMouseMove={(e) => !disabled && draw(getMousePos(e))}
              onMouseUp={() => !disabled && stopDrawing()}
              onMouseLeave={() => !disabled && stopDrawing()}
              onTouchStart={(e) => {
                if (!disabled) {
                  e.preventDefault()
                  startDrawing(getTouchPos(e))
                }
              }}
              onTouchMove={(e) => {
                if (!disabled) {
                  e.preventDefault()
                  draw(getTouchPos(e))
                }
              }}
              onTouchEnd={(e) => {
                if (!disabled) {
                  e.preventDefault()
                  stopDrawing()
                }
              }}
            />
            {/* Draw Instructions */}
            {strokes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              </div>
            )}
          </div>
        )}

        {signatureType === 'upload' && (
          <div className="p-6">
            <div 
              className="w-full h-[250px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Click to upload signature image
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  PNG, JPG, or SVG
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      {withSubmit && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            type="button"
            disabled={disabled || isEmpty()}
            onClick={(e) => {
              e.preventDefault()
              if (!disabled) handleSave()
            }}
            className="w-full"
          >
            {saveButtonText}
          </Button>
        </div>
      )}
    </div>
  )
})

SignatureMaker.displayName = "SignatureMaker"

export { SignatureMaker }
