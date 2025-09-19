'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from 'web-utils-common'
import { Input } from 'web-utils-components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'web-utils-components/select'
import { Card } from 'web-utils-components/card'
import { CreditCard as CreditCardIcon, Lock } from 'lucide-react'

// Enhanced Card vendor SVG icons with better styling
const CardIcons = {
  visa: (
    <svg viewBox="              <SelectTrigger
                className={cn(
                  'bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
                  focusedField === 'expiryYear' && 'ring-2 ring-primary/20 border-primary/50',
                  errors.expiryYear && 'border-destructive',
                )} 24" className="w-10 h-6">
      <rect width="40" height="24" rx="4" fill="#1A1F71" />
      <text
        x="20"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        VISA
      </text>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect width="40" height="24" rx="4" fill="#000" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="25" cy="12" r="7" fill="#FF5F00" />
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect width="40" height="24" rx="4" fill="#006FCF" />
      <text
        x="20"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="6"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        AMEX
      </text>
    </svg>
  ),
  discover: (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect width="40" height="24" rx="4" fill="#FF6000" />
      <text
        x="20"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="5"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        DISCOVER
      </text>
    </svg>
  ),
  generic: <CreditCardIcon className="w-10 h-6 opacity-60" />,
}

// Card style variants with improved base style
export type CardStyle =
  | 'base'
  | 'shiny-silver'
  | 'amex-green'
  | 'amex-black'
  | 'metal'

const cardStyles: Record<CardStyle, string> = {
  // Enhanced base style with glassmorphism
  base: 'bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-700/50 text-card-foreground shadow-md dark:shadow-2xl',
  'shiny-silver':
    'bg-gradient-to-br from-gray-300/80 via-gray-100/80 to-gray-300/80 dark:from-gray-600/60 dark:via-gray-500/60 dark:to-gray-700/60 backdrop-blur-md border border-gray-400/50 dark:border-gray-500/50 text-gray-800 dark:text-gray-200 shadow-lg dark:shadow-2xl',
  'amex-green':
    'bg-gradient-to-br from-green-700/90 via-green-600/90 to-green-800/90 dark:from-green-800/70 dark:via-green-700/70 dark:to-green-900/70 backdrop-blur-md border border-green-500/50 dark:border-green-600/50 text-white shadow-lg dark:shadow-2xl',
  'amex-black':
    'bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 dark:from-gray-950/80 dark:via-black/80 dark:to-gray-900/80 backdrop-blur-md border border-gray-600/50 dark:border-gray-700/50 text-white shadow-lg dark:shadow-2xl',
  metal:
    'bg-gradient-to-br from-slate-600/80 via-slate-500/80 to-slate-700/80 dark:from-slate-700/60 dark:via-slate-600/60 dark:to-slate-800/60 backdrop-blur-md border border-slate-400/50 dark:border-slate-500/50 text-white shadow-lg dark:shadow-2xl',
}

const cardBackStyles: Record<CardStyle, string> = {
  base: 'bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-700/50 text-muted-foreground shadow-md dark:shadow-2xl',
  'shiny-silver':
    'bg-gradient-to-br from-gray-400/80 via-gray-200/80 to-gray-400/80 dark:from-gray-600/60 dark:via-gray-500/60 dark:to-gray-700/60 backdrop-blur-md border border-gray-500/50 dark:border-gray-500/50 text-gray-800 dark:text-gray-200 shadow-lg dark:shadow-2xl',
  'amex-green':
    'bg-gradient-to-br from-green-800/90 via-green-700/90 to-green-900/90 dark:from-green-900/70 dark:via-green-800/70 dark:to-green-950/70 backdrop-blur-md border border-green-600/50 dark:border-green-700/50 text-white shadow-lg dark:shadow-2xl',
  'amex-black':
    'bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 dark:from-gray-950/80 dark:via-black/80 dark:to-gray-900/80 backdrop-blur-md border border-gray-700/50 dark:border-gray-800/50 text-white shadow-lg dark:shadow-2xl',
  metal:
    'bg-gradient-to-br from-slate-700/80 via-slate-600/80 to-slate-800/80 dark:from-slate-800/60 dark:via-slate-700/60 dark:to-slate-900/60 backdrop-blur-md border border-slate-500/50 dark:border-slate-600/50 text-white shadow-lg dark:shadow-2xl',
}

export interface CreditCardValue {
  cardholderName: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

export interface CreditCardProps {
  value?: CreditCardValue
  onChange?: (value: CreditCardValue) => void
  onValidationChange?: (isValid: boolean, errors: ValidationErrors) => void
  className?: string
  ref?: React.RefObject<CreditCardRef>
  cvvLabel?: 'CCV' | 'CVC'
  cardStyle?: CardStyle
  showVendor?: boolean;
  disabled?: boolean
}

export interface CreditCardRef {
  validate: () => boolean
  isValid: () => boolean
  focus: () => void
  reset: () => void
  getErrors: () => ValidationErrors
}

interface ValidationErrors {
  cardholderName?: string
  cardNumber?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  general?: string
}

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ''
  const parts: string[] = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

const getCardType = (number: string): keyof typeof CardIcons => {
  const cleanNumber = number.replace(/\s/g, '')

  // Visa: starts with 4
  if (cleanNumber.startsWith('4')) return 'visa'

  // Mastercard: starts with 5 or 2221-2720
  if (
    cleanNumber.startsWith('5') ||
    (cleanNumber.startsWith('2') &&
      parseInt(cleanNumber.substring(0, 4)) >= 2221 &&
      parseInt(cleanNumber.substring(0, 4)) <= 2720)
  ) {
    return 'mastercard'
  }

  // American Express: starts with 34 or 37
  if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37'))
    return 'amex'

  // Discover: starts with 6011, 622126-622925, 644-649, 65
  if (
    cleanNumber.startsWith('6011') ||
    cleanNumber.startsWith('65') ||
    cleanNumber.startsWith('644') ||
    cleanNumber.startsWith('645') ||
    cleanNumber.startsWith('646') ||
    cleanNumber.startsWith('647') ||
    cleanNumber.startsWith('648') ||
    cleanNumber.startsWith('649')
  ) {
    return 'discover'
  }

  return 'generic'
}

const validateCreditCard = (
  value: CreditCardValue,
  cvvLabel: string,
): ValidationErrors => {
  const errors: ValidationErrors = {}

  // Validate cardholder name
  if (!value.cardholderName?.trim()) {
    errors.cardholderName = 'Cardholder name is required'
  } else if (value.cardholderName.trim().length < 2) {
    errors.cardholderName = 'Name must be at least 2 characters'
  }

  // Validate card number
  const cleanCardNumber = value.cardNumber?.replace(/\s/g, '') || ''
  if (!cleanCardNumber) {
    errors.cardNumber = 'Card number is required'
  } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    errors.cardNumber = 'Invalid card number length'
  } else if (!/^\d+$/.test(cleanCardNumber)) {
    errors.cardNumber = 'Card number must contain only digits'
  }

  // Validate expiry month
  if (!value.expiryMonth?.trim()) {
    errors.expiryMonth = 'Expiry month is required'
  }

  // Validate expiry year
  if (!value.expiryYear?.trim()) {
    errors.expiryYear = 'Expiry year is required'
  } else if (value.expiryMonth && value.expiryYear) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const expiryYear = parseInt(value.expiryYear)
    const expiryMonth = parseInt(value.expiryMonth)

    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      errors.expiryYear = 'Card has expired'
    }
  }

  // Validate CVV
  const cardType = getCardType(value.cardNumber || '')
  const expectedCvvLength = cardType === 'amex' ? 4 : 3
  if (!value.cvv?.trim()) {
    errors.cvv = `${cvvLabel} is required`
  } else if (value.cvv.length !== expectedCvvLength) {
    errors.cvv = `${cvvLabel} must be ${expectedCvvLength} digits`
  } else if (!/^\d+$/.test(value.cvv)) {
    errors.cvv = `${cvvLabel} must contain only digits`
  }

  return errors
}

function CreditCard({
  value,
  onChange,
  onValidationChange,
  className,
  ref,
  cvvLabel = 'CVC',
  cardStyle = 'base',
  showVendor = true,
  disabled = false
}: CreditCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<ValidationErrors>({})

  // 3D hover effect using framer-motion
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]))
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]))

  // Internal refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null)
  const cardholderInputRef = useRef<HTMLInputElement>(null)
  const cardNumberInputRef = useRef<HTMLInputElement>(null)
  const cvvInputRef = useRef<HTMLInputElement>(null)

  const currentValue = React.useMemo(() => {
    return value || {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    }
  }, [value])

  const validateAndUpdate = React.useCallback((newValue: CreditCardValue) => {
    const validationErrors = validateCreditCard(newValue, cvvLabel)
    setErrors(validationErrors)

    const isValid = Object.keys(validationErrors).length === 0
    onValidationChange?.(isValid, validationErrors)

    return isValid
  }, [cvvLabel, onValidationChange])

  const handleInputChange = (
    field: keyof CreditCardValue,
    newValue: string,
  ) => {
    const updatedValue = { ...currentValue, [field]: newValue }
    onChange?.(updatedValue)
    validateAndUpdate(updatedValue)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 19) {
      handleInputChange('cardNumber', formatted)
    }
  }

  const handleCvvFocus = () => {
    setIsFlipped(true)
    setFocusedField('cvv')
  }

  const handleCvvBlur = () => {
    setIsFlipped(false)
    setFocusedField(null)
  }

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleFieldBlur = () => {
    setFocusedField(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = React.useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleValidate = React.useCallback(() => {
    const isValid = validateAndUpdate(currentValue)

    if (!isValid) {
      if (errors.cardholderName) {
        cardholderInputRef.current?.focus()
      } else if (errors.cardNumber) {
        cardNumberInputRef.current?.focus()
      } else if (errors.cvv) {
        cvvInputRef.current?.focus()
      }
    }

    return isValid
  }, [currentValue, errors, validateAndUpdate])

  const handleReset = React.useCallback(() => {
    setErrors({})
    setFocusedField(null)
    setIsFlipped(false)
    onChange?.({
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    })
  }, [onChange])

  const handleFocus = React.useCallback(() => {
    cardholderInputRef.current?.focus()
  }, [])

  const getErrors = React.useCallback(() => errors, [errors])

  // React 19: Expose imperative methods via ref callback
  useEffect(() => {
    if (ref && 'current' in ref) {
      ref.current = {
        validate: handleValidate,
        isValid: () =>
          Object.keys(validateCreditCard(currentValue, cvvLabel)).length === 0,
        focus: handleFocus,
        reset: handleReset,
        getErrors,
      }
    }
  }, [ref, cvvLabel, currentValue, errors, handleValidate, handleReset, getErrors, handleFocus])

  const cardType = getCardType(currentValue.cardNumber)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
      value: month.toString().padStart(2, '0'),
      label: month.toString().padStart(2, '0'),
    }
  })

  // Get chip color based on card style with glassy effects
  const getChipColor = () => {
    switch (cardStyle) {
      case 'base':
        return 'bg-gradient-to-br from-yellow-400/80 to-yellow-600/80 dark:from-yellow-500/70 dark:to-yellow-700/70 backdrop-blur-sm border border-yellow-500/30'
      case 'shiny-silver':
        return 'bg-gradient-to-br from-yellow-500/80 to-yellow-700/80 dark:from-yellow-600/70 dark:to-yellow-800/70 backdrop-blur-sm border border-yellow-600/30'
      case 'amex-green':
      case 'amex-black':
        return 'bg-gradient-to-br from-yellow-300/90 to-yellow-500/90 dark:from-yellow-400/80 dark:to-yellow-600/80 backdrop-blur-sm border border-yellow-400/40'
      case 'metal':
        return 'bg-gradient-to-br from-yellow-200/80 to-yellow-400/80 dark:from-yellow-300/70 dark:to-yellow-500/70 backdrop-blur-sm border border-yellow-300/30'
      default:
        return 'bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 dark:from-yellow-400/70 dark:to-yellow-600/70 backdrop-blur-sm border border-yellow-400/30'
    }
  }

  return (
    <div ref={containerRef} className={cn('w-full max-w-sm py-2', className)}>
      {/* Card Container with 3D effects using Tailwind CSS utilities */}
      <div className="relative h-56 mb-6 [perspective:1000px]">
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{
            rotateX: rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Front of Card */}
          <Card
            className={cn(
              'absolute inset-0 w-full h-full p-6 flex flex-col justify-between [backface-visibility:hidden] shadow-md dark:shadow-xl',
              cardStyles[cardStyle],
              disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            )}
          >
            <div className="flex justify-between items-start">
              <div
                className={cn('w-12 h-8 rounded shadow-sm dark:shadow-md', getChipColor())}
              ></div>
              {/* Vendor logo moved to top right for now, will be repositioned */}
            </div>

            <div className="space-y-4">
              <div className="text-xl font-mono tracking-wider font-bold">
                {currentValue.cardNumber || '•••• •••• •••• ••••'}
              </div>

              {/* Bottom row: cardholder - expires - vendor logo */}
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="text-xs opacity-70 uppercase font-medium">
                    Card Holder
                  </div>
                  <div className="font-bold text-sm">
                    {currentValue.cardholderName || 'YOUR NAME'}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs opacity-70 uppercase font-medium">
                    Expires
                  </div>
                  <div className="font-bold text-sm">
                    {currentValue.expiryMonth && currentValue.expiryYear
                      ? `${currentValue.expiryMonth}/${currentValue.expiryYear.slice(-2)}`
                      : 'MM/YY'}
                  </div>
                </div>
                <div className="flex-1 flex justify-end">
                  {showVendor && CardIcons[cardType]}
                </div>
              </div>
            </div>
          </Card>

          {/* Back of Card */}
          <Card
            className={cn(
              'absolute inset-0 w-full h-full p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] border shadow-sm dark:shadow-xl',
              cardBackStyles[cardStyle],
              disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            )}
          >
            <div className="w-full h-12 bg-black/80 dark:bg-black/60 backdrop-blur-sm mt-4 shadow-inner rounded-sm"></div>

            <div className="flex justify-end items-center space-x-4">
              <div className="text-right">
                <div className="text-xs opacity-70 uppercase font-medium">
                  {cvvLabel}
                </div>
                <div className="bg-white/90 dark:bg-gray-100/90 backdrop-blur-sm border border-white/50 dark:border-gray-300/50 text-black px-3 py-1 rounded text-center font-mono font-bold shadow-md">
                  {currentValue.cvv || '•••'}
                </div>
              </div>
              <Lock className="w-6 h-6 opacity-60" />
            </div>

            <div className="text-xs opacity-60 text-center font-medium">
              This card is protected by advanced security features
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Cardholder Name
          </label>
          <Input
            ref={cardholderInputRef}
            type="text"
            placeholder="John Doe"
            value={currentValue.cardholderName}
            onChange={(e) =>
              handleInputChange('cardholderName', e.target.value.toUpperCase())
            }
            disabled={disabled}
            onFocus={() => handleFieldFocus('cardholderName')}
            onBlur={handleFieldBlur}
            className={cn(
              'bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
              focusedField === 'cardholderName' && 'ring-2 ring-primary/20 border-primary/50',
              errors.cardholderName && 'border-destructive',
            )}
          />
          {errors.cardholderName && (
            <p className="text-destructive text-xs mt-1">
              {errors.cardholderName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Card Number</label>
          <Input
            ref={cardNumberInputRef}
            type="text"
            placeholder="1234 5678 9012 3456"
            value={currentValue.cardNumber}
            onChange={handleCardNumberChange}
            onFocus={() => handleFieldFocus('cardNumber')}
            onBlur={handleFieldBlur}
            disabled={disabled}
            className={cn(
              'font-mono bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
              focusedField === 'cardNumber' && 'ring-2 ring-primary/20 border-primary/50',
              errors.cardNumber && 'border-destructive',
            )}
            maxLength={19}
          />
          {errors.cardNumber && (
            <p className="text-destructive text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <Select
              value={currentValue.expiryMonth}
              onValueChange={(value) => handleInputChange('expiryMonth', value)}
            >
              <SelectTrigger
                className={cn(
                  'bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
                  focusedField === 'expiryMonth' && 'ring-2 ring-primary/20 border-primary/50',
                  errors.expiryMonth && 'border-destructive',
                )}
                disabled={disabled}
              >
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.expiryMonth && (
              <p className="text-destructive text-xs mt-1">
                {errors.expiryMonth}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <Select
              value={currentValue.expiryYear}
              onValueChange={(value) => handleInputChange('expiryYear', value)}
            >
              <SelectTrigger
                className={cn(
                  'bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
                  focusedField === 'expiryYear' && 'ring-2 ring-primary/20 border-primary/50',
                  errors.expiryYear && 'border-destructive',
                )}
                disabled={disabled}
              >
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.expiryYear && (
              <p className="text-destructive text-xs mt-1">
                {errors.expiryYear}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{cvvLabel}</label>
            <Input
              ref={cvvInputRef}
              type="text"
              placeholder="123"
              value={currentValue.cvv}
              disabled={disabled}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                if (value.length <= (cardType === 'amex' ? 4 : 3)) {
                  handleInputChange('cvv', value)
                }
              }}
              onFocus={handleCvvFocus}
              onBlur={handleCvvBlur}
              className={cn(
                'font-mono text-center bg-transparent border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
                focusedField === 'cvv' && 'ring-2 ring-primary/20 border-primary/50',
                errors.cvv && 'border-destructive',
              )}
              maxLength={cardType === 'amex' ? 4 : 3}
            />
            {errors.cvv && (
              <p className="text-destructive text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CreditCard.displayName = 'CreditCard'

export { CreditCard }