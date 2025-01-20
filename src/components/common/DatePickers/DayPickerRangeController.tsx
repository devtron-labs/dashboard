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

import React, { Component } from 'react'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import CustomizableCalendarDay from 'react-dates/esm/components/CustomizableCalendarDay.js'
import ReactGA from 'react-ga4'
import moment, { Moment } from 'moment'
import { isInclusivelyBeforeDay, DayPickerRangeController } from 'react-dates'
import './calendar.css'
import { ReactComponent as ArrowDown } from '../../../assets/icons/ic-chevron-down.svg'

interface DatePickerType2Props {
    calendar
    calendarInputs
    focusedInput
    handleFocusChange
    handleDatesChange
    handleCalendarInputs?
    calendarValue: string
    handlePredefinedRange: (start: Moment, end: Moment, endStr: string) => void
    handleDateInput: (key: 'startDate' | 'endDate', value: string) => void
    handleApply: (...args) => void
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

const customDayStyles = {
    selectedStartStyles: selectedStyles,
    selectedEndStyles: selectedStyles,
    hoveredSpanStyles,
    selectedSpanStyles,
    selectedStyles,
    border: 'none',
}

const styless = {
    PresetDateRangePicker_panel: {
        padding: '0px',
        width: '200px',
        height: '100%',
    },
    PresetDateRangePicker_button: {
        width: '188px',
        background: 'var(--transparent)',
        border: 'none',
        color: 'var(--N900)',
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
    DayPicker__horizontal: {
        borderRadius: '4px',
    },
    PresetDateRangePicker_button__selected: {
        color: 'var(--B500)',
        fontWeight: 600,
        background: 'var(--B100)',
        outline: 'none',
    },
}

const DayPicker_calendarInfo__horizontal = {
    width: '532px',
    boxShadow: 'none',
}

export const DayPickerRangeControllerPresets = [
    { text: 'Last 5 minutes', endDate: moment(), startDate: moment().subtract(5, 'minutes'), endStr: 'now-5m' },
    { text: 'Last 30 minutes', endDate: moment(), startDate: moment().subtract(30, 'minutes'), endStr: 'now-30m' },
    { text: 'Last 1 hour', endDate: moment(), startDate: moment().subtract(1, 'hours'), endStr: 'now-1h' },
    { text: 'Last 24 hours', endDate: moment(), startDate: moment().subtract(24, 'hours'), endStr: 'now-24h' },
    { text: 'Last 7 days', endDate: moment(), startDate: moment().subtract(7, 'days'), endStr: 'now-7d' },
    { text: 'Last 1 month', endDate: moment(), startDate: moment().subtract(1, 'months'), endStr: 'now-1M' },
    { text: 'Last 6 months', endDate: moment(), startDate: moment().subtract(6, 'months'), endStr: 'now-6M' },
]

export class DatePickerType2 extends Component<DatePickerType2Props, any> {
    constructor(props) {
        super(props)
        this.state = {
            showCalendar: false,
        }
        this.renderDatePresets = this.renderDatePresets.bind(this)
    }

    getInitialVisibleMonth = () => {
        return this.props.calendar.endDate
    }

    handleIsDayBlocked(day) {
        return false
    }

    renderDatePresets() {
        return (
            <div
                className="flex left top"
                style={{
                    ...styless.PresetDateRangePicker_panel,
                    ...DayPicker_calendarInfo__horizontal,
                    ...{
                        PresetDateRangePicker_panel: {
                            padding: '0px',
                            width: '200px',
                            height: '100%',
                        },
                        ...styless.DayPicker__horizontal,
                    },
                }}
            >
                <div style={{ width: '312px', borderLeft: 'solid 1px var(--N200)', height: '304px', padding: '16px' }}>
                    <p className="mb-16 fw-6">Pick time range</p>
                    <div>
                        <label className="w-100 mb-16">
                            From
                            <input
                                type="text"
                                className="dc__block w-100 dc__border"
                                value={this.props.calendarInputs.startDate}
                                onChange={(event) => {
                                    this.props.handleDateInput('startDate', event.target.value)
                                }}
                            />
                        </label>
                        <label className="w-100 mb-16">
                            To
                            <input
                                type="text"
                                className="dc__block w-100 dc__border"
                                value={this.props.calendarInputs.endDate}
                                onChange={(event) => {
                                    this.props.handleDateInput('endDate', event.target.value)
                                }}
                            />
                        </label>
                        <button
                            type="button"
                            className="cta small"
                            onClick={() => {
                                this.setState({ showCalendar: false })
                                this.props.handleApply()
                            }}
                        >
                            Apply Time Range
                        </button>
                    </div>
                </div>
                <div style={{ width: '220px', padding: '16px', borderLeft: 'solid 1px var(--N200)', height: '304px' }}>
                    {DayPickerRangeControllerPresets.map(({ text, startDate, endDate, endStr }) => {
                        const isSelected =
                            startDate.isSame(this.props.calendar.startDate, 'minute') &&
                            startDate.isSame(this.props.calendar.startDate, 'hour') &&
                            startDate.isSame(this.props.calendar.startDate, 'day') &&
                            endDate.isSame(this.props.calendar.endDate, 'day')
                        let buttonStyles = {
                            ...styless.PresetDateRangePicker_button,
                        }
                        if (isSelected) {
                            buttonStyles = {
                                ...buttonStyles,
                                ...styless.PresetDateRangePicker_button__selected,
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
                                    this.props.handlePredefinedRange(startDate, endDate, endStr)
                                    this.setState({ showCalendar: false })
                                }}
                            >
                                {text}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    render() {
        return (
            <>
                <div
                    data-testid="app-metrics-range-picker-box"
                    className="flex"
                    style={{ borderRadius: '4px', border: 'solid 1px var(--N200)' }}
                    onClick={() => {
                        this.setState({ showCalendar: !this.state.showCalendar })
                    }}
                >
                    <p className="cursor" style={{ marginBottom: '0', height: '32px', padding: '5px' }}>
                        {this.props.calendarValue}
                    </p>
                    <ArrowDown className="icon-dim-20 dc__inline-block fcn-6" />
                </div>
                {this.state.showCalendar && (
                    <DayPickerRangeController
                        startDate={this.props.calendar.startDate}
                        endDate={this.props.calendar.endDate}
                        focusedInput={this.props.focusedInput}
                        onDatesChange={this.props.handleDatesChange}
                        onFocusChange={this.props.handleFocusChange}
                        numberOfMonths={1}
                        withPortal
                        renderCalendarInfo={this.renderDatePresets}
                        calendarInfoPosition="after"
                        hideKeyboardShortcutsPanel
                        isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())} // enable past dates
                        renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
                        onOutsideClick={() => {
                            this.setState({ showCalendar: false })
                        }}
                        initialVisibleMonth={() => moment().subtract(2, 'd')} //
                    />
                )}
            </>
        )
    }
}
