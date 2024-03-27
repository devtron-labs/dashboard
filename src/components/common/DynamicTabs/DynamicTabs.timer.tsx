import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback }: TimerType) => {
    const [now, setNow] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            const _now = moment()
            setNow(getTimeElapsed(start, _now))
            callback?.(_now)
        }, 1000)

        return () => clearInterval(interval)
    }, [start])

    return <span>{now || '0s'}</span>
}

export default Timer
