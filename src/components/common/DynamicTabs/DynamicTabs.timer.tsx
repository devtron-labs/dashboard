import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback, transition, transpose, format = getTimeElapsed }: TimerType) => {
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState('')

    useEffect(() => {
        setLoading(true)
        const interval = setInterval(() => {
            setLoading(false)
            const _now = dayjs()
            setNow(format(start, _now))
            callback?.(_now)
        }, 1000)

        return () => clearInterval(interval)
    }, [start])

    return loading ? transition() : transpose?.(now) || <span>{now || '0s'}</span>
}

export default Timer
