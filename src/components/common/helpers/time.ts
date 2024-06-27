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

import { DATE_TIME_FORMAT_STRING, ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'

/**
 * @deprecated use handleUTCTime from common lib
 */
export function handleUTCTime(ts: string, isRelativeTime = false) {
    let timestamp = ''
    try {
        if (ts && ts.length) {
            const date = moment(ts)
            if (isRelativeTime) {
                timestamp = date.fromNow()
            } else {
                timestamp = date.format(DATE_TIME_FORMAT_STRING)
            }
        }
    } catch (error) {
        console.error('Error Parsing Date:', ts)
    }
    return timestamp
}

export const getTimeElapsed = (startedOn, finishedOn) => {
    const diff: moment.Duration = moment.duration(finishedOn.diff(startedOn))
    const hours = diff.hours() > 0 ? `${String(diff.hours()).padStart(2, '0')}h:` : ''
    const minutes = diff.minutes() > 0 ? `${String(diff.minutes()).padStart(2, '0')}m:` : ''
    const seconds = String(diff.seconds()).padStart(2, '0')
    return `${hours}${minutes}${seconds}s`
}

export const formatDurationDiff = (startedOn: string, finishedOn: string) => {
    const diff: moment.Duration = moment.duration(moment(finishedOn).diff(moment(startedOn)))
    const hours = diff.hours() > 0 ? `${diff.hours()}h ` : ''
    const minutes = diff.minutes() > 0 ? `${diff.minutes()}m ` : ''
    const seconds = `${diff.seconds()}s`
    return `${hours}${minutes}${seconds}`
}
