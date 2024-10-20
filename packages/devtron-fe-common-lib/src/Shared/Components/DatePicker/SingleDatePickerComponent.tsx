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

import { useState } from 'react'
import { SingleDatePicker } from 'react-dates'
import moment, { Moment } from 'moment'
import CustomizableCalendarDay from 'react-dates/lib/components/CustomizableCalendarDay'
import { SingleDatePickerProps } from './types'
import { customDayStyles } from './constants'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import CalenderIcon from '../../../Assets/Icon/ic-calender-blank.svg'

const blockToday = (day: Moment): boolean => day.isSame(moment(), 'day')

/**
 *
 * @param date  Date value to be displayed
 * @param handleDatesChange Function to handle date change
 * @param readOnly Value to make date picker read only
 * @param isTodayBlocked Value to block today's date
 * @returns
 */

const SingleDatePickerComponent = ({
    date,
    handleDatesChange,
    readOnly,
    isTodayBlocked,
    displayFormat,
    dataTestId,
}: SingleDatePickerProps) => {
    const [focused, setFocused] = useState(false)

    const handleFocusChange = (props) => {
        setFocused(props.focused)
    }

    const renderCustomDay = (props) => <CustomizableCalendarDay {...props} {...customDayStyles} />

    return (
        <SingleDatePicker
            id="single_date_picker"
            placeholder="Select date"
            date={date}
            onDateChange={handleDatesChange}
            focused={focused}
            onFocusChange={handleFocusChange}
            numberOfMonths={1}
            openDirection="down"
            renderCalendarDay={(props) => renderCustomDay(props)}
            hideKeyboardShortcutsPanel
            withFullScreenPortal={false}
            orientation="horizontal"
            readOnly={readOnly || false}
            isDayBlocked={isTodayBlocked ? blockToday : undefined}
            customInputIcon={<CalenderIcon />}
            inputIconPosition="after"
            displayFormat={displayFormat}
            data-testid={dataTestId}
        />
    )
}
export default SingleDatePickerComponent
