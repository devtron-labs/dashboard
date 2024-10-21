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

import { SingleDatePicker } from 'react-dates'
import { SelectInstance } from 'react-select'
import moment from 'moment'
import CustomizableCalendarDay from 'react-dates/esm/components/CustomizableCalendarDay'
import { useState } from 'react'
import { ReactComponent as ClockIcon } from '@Icons/ic-clock.svg'
import { ReactComponent as CalendarIcon } from '@Icons/ic-calendar.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ComponentSizeType } from '@Shared/constants'
import { DEFAULT_TIME_OPTIONS, getTimeValue, updateDate, updateTime } from './utils'
import { DateTimePickerProps } from './types'
import { DATE_PICKER_IDS, DATE_PICKER_PLACEHOLDER, customDayStyles } from './constants'
import './datePicker.scss'
import { DATE_TIME_FORMATS } from '../../../Common'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { SelectPicker } from '../SelectPicker'

const DateTimePicker = ({
    date: dateObject = new Date(),
    onChange,
    timePickerProps = {} as SelectInstance,
    disabled,
    id,
    label,
    required,
    hideTimeSelect = false,
    readOnly = false,
    isTodayBlocked = false,
    dataTestIdForTime = DATE_PICKER_IDS.TIME,
    dataTestidForDate = DATE_PICKER_IDS.DATE,
    openDirection = 'down',
    error = '',
}: DateTimePickerProps) => {
    const time = getTimeValue(dateObject)
    const selectedTimeOption = DEFAULT_TIME_OPTIONS.find((option) => option.value === time) ?? DEFAULT_TIME_OPTIONS[0]
    const [isFocused, setFocused] = useState(false)

    const handleFocusChange = ({ focused }) => {
        setFocused(focused)
    }
    const handleDateChange = (event) => {
        onChange(updateDate(dateObject, event?.toDate()))
    }

    const handleTimeChange = (option) => {
        onChange(updateTime(dateObject, option.value).value)
    }

    const today = moment()
    // Function to disable dates including today and all past dates
    const isDayBlocked = (day) => isTodayBlocked && !day.isAfter(today)

    return (
        <div className="date-time-picker">
            <label className={`form__label ${required ? 'dc__required-field' : ''}`} htmlFor={id}>
                {label}
            </label>
            <div className="flex left dc__gap-8">
                <SingleDatePicker
                    id={id}
                    placeholder="Select date"
                    date={moment(dateObject)}
                    onDateChange={handleDateChange}
                    focused={isFocused}
                    onFocusChange={handleFocusChange}
                    numberOfMonths={1}
                    openDirection={openDirection}
                    renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
                    hideKeyboardShortcutsPanel
                    withFullScreenPortal={false}
                    orientation="horizontal"
                    readOnly={readOnly || false}
                    customInputIcon={<CalendarIcon className="icon-dim-20" />}
                    inputIconPosition="after"
                    displayFormat={DATE_TIME_FORMATS.DD_MMM_YYYY}
                    data-testid={dataTestidForDate}
                    isDayBlocked={isDayBlocked}
                    disabled={disabled}
                    appendToBody
                />
                {!hideTimeSelect && (
                    <div className="dc__no-shrink">
                        <SelectPicker
                            inputId={DATE_PICKER_IDS.TIME}
                            placeholder={DATE_PICKER_PLACEHOLDER.DEFAULT_TIME}
                            options={DEFAULT_TIME_OPTIONS}
                            icon={<ClockIcon className="icon-dim-20 fcn-6" />}
                            isSearchable={false}
                            hideSelectedOptions
                            isDisabled={disabled}
                            {...timePickerProps}
                            value={selectedTimeOption}
                            onChange={handleTimeChange}
                            data-testid={dataTestIdForTime}
                            menuSize={ComponentSizeType.xs}
                            size={ComponentSizeType.large}
                            shouldMenuAlignRight
                        />
                    </div>
                )}
            </div>
            {error && (
                <div className="form__error">
                    <ICWarning className="form__icon form__icon--error" />
                    {error}
                </div>
            )}
        </div>
    )
}

export default DateTimePicker
