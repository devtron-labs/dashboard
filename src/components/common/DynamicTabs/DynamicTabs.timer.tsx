import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback }: TimerType) => {
    const [now, setNow] = useState(getTimeElapsed(start, moment()))

    useEffect(() => {
        const interval = setInterval(() => {
            const _now = moment()
            setNow(getTimeElapsed(start, _now))
            callback?.(_now)
        }, 900)

        return () => clearInterval(interval)
    }, [start])

    return <span>{now}</span>
}

export default Timer
