/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import { TimerType } from './Types'
import { getTimeElapsed } from '../helpers/time'

const Timer: React.FC<TimerType> = ({ start, callback, transition, transpose, format = getTimeElapsed }: TimerType) => {
    const [loading, setLoading] = useState(false)
    const [now, setNow] = useState(format(start, dayjs()))
    const intervalRef = useRef(null)

    const getTimerInterval = () =>
        setInterval(() => {
            const _now = dayjs()
            setNow(format(start, _now))
            callback?.(_now)
        }, 1000)

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
