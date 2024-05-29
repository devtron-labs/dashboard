import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback, transition, transpose, format = getTimeElapsed }: TimerType) => {
    const [loading, setLoading] = useState(false)
    const [now, setNow] = useState(format(start, dayjs()))
    const intervalRef = useRef(null)

    const getTimerInterval = () => {
        return setInterval(() => {
            const _now = dayjs()
            setNow(format(start, _now))
            callback?.(_now)
        }, 1000)
    }

    useEffect(() => {
        intervalRef.current = getTimerInterval()
        return () => clearInterval(intervalRef.current)
    }, [])

    useEffectAfterMount(() => {
        setLoading(true)
        const timeout = setTimeout(() => setLoading(false), 1000)
        clearInterval(intervalRef.current)
        intervalRef.current = getTimerInterval()
        return () => clearTimeout(timeout)
    }, [start])

    return loading ? transition() : transpose?.(now) || <span>{now || '0s'}</span>
}

export default Timer
