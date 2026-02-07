'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-2xl shadow-lg px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]">
        <span className="text-2xl sm:text-4xl font-bold text-rose-500">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm text-gray-600 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <span className="text-2xl sm:text-4xl text-rose-300 font-light">:</span>
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <span className="text-2xl sm:text-4xl text-rose-300 font-light">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="text-2xl sm:text-4xl text-rose-300 font-light">:</span>
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  )
}
