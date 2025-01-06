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

import React, { Component, useState } from 'react'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import CustomizableCalendarDay from 'react-dates/esm/components/CustomizableCalendarDay.js'
import ReactGA from 'react-ga4'
import moment, { Moment } from 'moment'
import { isInclusivelyBeforeDay, DateRangePicker, SingleDatePicker } from 'react-dates'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import './calendar.css'

interface DatePickerProps {
    endDate
    startDate
    handleFocusChange
    handleDatesChange
    focusedInput
}

const hoveredSpanStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',
}

const selectedStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',

    hover: {
        background: 'var(--B500)',
        color: 'var(--N0)',
    },
}

const selectedSpanStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',
    hover: {
        background: 'var(--B500)',
        color: 'var(--N0)',
    },
}

export const customDayStyles = {
    selectedStartStyles: selectedStyles,
    selectedEndStyles: selectedStyles,
    hoveredSpanStyles,
    selectedSpanStyles,
    selectedStyles,
    border: 'none',
}

const styless = {
    PresetDateRangePicker_panel: {
        padding: '22px 16px',
        width: '200px',
        height: '100%',
    },
    PresetDateRangePicker_button: {
        width: '178px',
        background: 'white',
        border: 'none',
        color: 'black',
        padding: '8px',
        font: 'inherit',
        fontWeight: 500,
        lineHeight: 'normal',
        overflow: 'visible',
        cursor: 'pointer',
        ':active': {
            outline: 0,
        },
    },
    DayPicker_portal__horizontal: {
        zIndex: 1,
    },
    PresetDateRangePicker_button__selected: {
        color: 'var(--B500)',
        fontWeight: 600,
        background: 'var(--B100)',
        outline: 'none',
    },
}

export class DatePicker extends Component<DatePickerProps> {
    constructor(props) {
        super(props)

        this.renderDatePresets = this.renderDatePresets.bind(this)
    }

    getInitialVisibleMonth = () => {
        return this.props.endDate
    }

    handleIsDayBlocked(day) {
        return false
    }

    renderDatePresets() {
        const p = [
            { text: 'Last 15 days', end: moment(), start: moment().subtract(15, 'days') },
            { text: 'Last 1 month', end: moment(), start: moment().subtract(1, 'months') },
            { text: 'Last 2 months', end: moment(), start: moment().subtract(2, 'months') },
            { text: 'Last 3 months', end: moment(), start: moment().subtract(3, 'months') },
            { text: 'Last 4 months', end: moment(), start: moment().subtract(4, 'months') },
            { text: 'Last 5 months', end: moment(), start: moment().subtract(5, 'months') },
            { text: 'Last 6 months', end: moment(), start: moment().subtract(6, 'months') },
        ]
        return (
            <div style={{ ...styless.PresetDateRangePicker_panel }}>
                {p.map(({ text, start, end }) => {
                    const isSelected =
                        start.isSame(this.props.startDate, 'day') && end.isSame(this.props.endDate, 'day')
                    let buttonStyles = {
                        ...styless.PresetDateRangePicker_button,
                    }
                    if (isSelected) {
                        buttonStyles = {
                            ...buttonStyles,
                            ...styless.PresetDateRangePicker_button__selected,
                            ...styless.DayPicker_portal__horizontal,
                        }
                    }
                    return (
                        <button
                            type="button"
                            key={text}
                            style={{ ...buttonStyles, textAlign: 'left' }}
                            onClick={() => {
                                ReactGA.event({
                                    category: 'Deployment Metrics',
                                    action: 'Date Range Changed',
                                    label: 'Predefined',
                                })
                                this.props.handleDatesChange({ startDate: start, endDate: end })
                                this.props.handleFocusChange(null)
                            }}
                        >
                            {text}
                        </button>
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <DateRangePicker
                startDate={this.props.startDate} // momentPropTypes.momentObj or null,
                startDateId="unique_start_date_id" // PropTypes.string.isRequired,
                endDate={this.props.endDate} // momentPropTypes.momentObj or null,
                endDateId="unique_end_date_id" // PropTypes.string.isRequired,
                onDatesChange={(range) => {
                    ReactGA.event({
                        category: 'Deployment Metrics',
                        action: 'Date Range Changed',
                        label: 'Custom',
                    })
                    this.props.handleDatesChange(range)
                }} // PropTypes.func.isRequired,
                focusedInput={this.props.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={this.props.handleFocusChange} // PropTypes.func.isRequired,
                displayFormat="DD-MM-YYYY"
                isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())} // enable past dates
                renderCalendarInfo={this.renderDatePresets}
                calendarInfoPosition="before"
                initialVisibleMonth={this.getInitialVisibleMonth}
                renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
                hideKeyboardShortcutsPanel
                numberOfMonths={1}
                block={false}
                small
                withFullScreenPortal={false}
                anchorDirection="right"
                orientation="horizontal"
                minimumNights={1}
                isDayBlocked={this.handleIsDayBlocked}
            />
        )
    }
}

interface SingleDatePickerProps {
    date: Moment
    handleDatesChange: (e) => void
    readOnly?: boolean
    isTodayBlocked?: boolean
}

const blockToday = (day: Moment): boolean => {
    return day.isSame(moment(), 'day')
}

/**
 *
 * @param param0 date, handleDatesChange, readOnly, isTodayBlocked
 *  @deprecated it  is replaced with DatePicker in common
 * @returns
 */

export const SingleDatePickerComponent = ({
    date,
    handleDatesChange,
    readOnly,
    isTodayBlocked,
}: SingleDatePickerProps) => {
    const [focused, setFocused] = useState(false)

    const handleFocusChange = ({ focused }) => {
        setFocused(focused)
    }

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
            renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
            hideKeyboardShortcutsPanel
            withFullScreenPortal={false}
            orientation="horizontal"
            readOnly={readOnly || false}
            isDayBlocked={isTodayBlocked ? blockToday : noop}
        />
    )
}
