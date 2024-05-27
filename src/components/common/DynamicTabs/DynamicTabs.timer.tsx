import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback, transition, transpose, format = getTimeElapsed }: TimerType) => {
    const [loading, setLoading] = useState(false)
    const [now, setNow] = useState(format(start, dayjs()))

    useEffect(() => {
        const interval = setInterval(() => {
            const _now = dayjs()
            setNow(format(start, _now))
            callback?.(_now)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffectAfterMount(() => {
        setLoading(true)
        const timeout = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timeout)
    }, [start])

    return loading ? transition() : transpose?.(now) || <span>{now || '0s'}</span>
}

export default Timer
