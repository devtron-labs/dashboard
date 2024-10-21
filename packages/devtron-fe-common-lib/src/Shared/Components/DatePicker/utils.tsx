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

import { SelectPickerOptionType } from '../SelectPicker'
import { MONTHLY_DATES_CONFIG, TIME_OPTIONS_CONFIG } from './constants'

/**
 * Return the options for the dates in label and value format
 */
export const MONTHLY_DATE_OPTIONS = Object.entries(MONTHLY_DATES_CONFIG).map(([label, value]) => ({
    label,
    value,
}))

/**
 * Return the options for the time in label and value format
 * @type {SelectPickerOptionType[]}
 */
// eslint-disable-next-line import/prefer-default-export
export const DEFAULT_TIME_OPTIONS: SelectPickerOptionType[] = Object.entries(TIME_OPTIONS_CONFIG).map(
    ([label, value]) => ({
        label,
        value,
    }),
)

const formatTimePart = (value: number) => (value < 10 ? `0${value}` : value)
/**
 * Get the time value from the date object in the format: `hh:mm:ss`
 */
export const getTimeValue = (currentDateObj: Date) => {
    const [hours, minutes, seconds] = [
        currentDateObj.getHours(),
        currentDateObj.getMinutes(),
        currentDateObj.getSeconds(),
    ].map(formatTimePart)

    return `${hours}:${minutes}:${seconds}`
}

/**
 * Updates the time in the given date object and returns the updated object
 */
export const updateTime = (currentDateObj: Date, timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map((t) => parseInt(t, 10))
    const updatedDate = new Date(currentDateObj)
    updatedDate.setHours(hours, minutes, seconds)

    return { label: updatedDate, value: updatedDate }
}

/**
 * Updates the date in the given date object and returns the updated object
 */
export const updateDate = (currentDateObj: Date, newDate: Date) => {
    // In case of null date, it will return the same date
    if (!newDate) {
        return currentDateObj
    }
    const day = newDate.getDate()
    const month = newDate.getMonth()
    const fullYear = newDate.getFullYear()

    const updatedDate = new Date(currentDateObj)
    updatedDate.setFullYear(fullYear, month, day)

    return updatedDate
}

/**
 * Get the default date from the time to live
 * @param timeToLive
 * @returns
 */

export const getDefaultDateFromTimeToLive = (timeToLive: string, isTomorrow?: boolean) => {
    const date = timeToLive ? new Date(timeToLive) : new Date()

    let hours = date.getHours()
    let minutes = date.getMinutes()

    if (minutes === 0 || minutes === 30) {
        // If minutes is already 0 or 30, leave it unchanged
    } else if (minutes < 30) {
        minutes = 30
    } else {
        minutes = 0
        hours += 1
    }

    // Handle date change
    if (isTomorrow) {
        // Get tomorrow's date
        const tomorrowDate = new Date(date)
        tomorrowDate.setHours(hours, minutes, 0)
        tomorrowDate.setDate(date.getDate() + 1)
        return tomorrowDate
    }
    const nextDate = new Date(date)
    nextDate.setHours(hours, minutes, 0)
    return nextDate
}
