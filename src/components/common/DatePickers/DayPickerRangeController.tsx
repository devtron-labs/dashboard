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

import { Component } from 'react'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import CustomizableCalendarDay from 'react-dates/esm/components/CustomizableCalendarDay.js'
import ReactGA from 'react-ga4'
import moment, { Moment } from 'moment'
import { isInclusivelyBeforeDay, DayPickerRangeController } from 'react-dates'
import './calendar.css'
import { ReactComponent as ArrowDown } from '../../../assets/icons/ic-chevron-down.svg'
import { DA_APP_DETAILS_GA_EVENTS } from '@Components/app/details/appDetails/constants'
import { Button, customDayStyles, DatePickerRangeControllerProps, DayPickerCalendarInfoHorizontal, DayPickerRangeControllerPresets } from '@devtron-labs/devtron-fe-common-lib/dist'
import { customStyles } from './constants'


export class DatePickerType2 extends Component<DatePickerRangeControllerProps, any> {
    constructor(props) {
        super(props)
        this.state = {
            showCalendar: false,
        }
        this.renderDatePresets = this.renderDatePresets.bind(this)
    }

    onClickApplyTimeChange = () => {
        this.setState({ showCalendar: false })
        this.props.handleApply()
        ReactGA.event(DA_APP_DETAILS_GA_EVENTS.MetricsApplyTimeChange)
    }

    onClickPredefinedTimeRange = (startDate: Moment, endDate: Moment, endStr: string) => () => {
        ReactGA.event(DA_APP_DETAILS_GA_EVENTS.MetricsPresetTimeRange)
        this.props.handlePredefinedRange(startDate, endDate, endStr)
        this.setState({ showCalendar: false })
    }

    renderDatePresets() {
        return (
            <div
                className="flex left top"
                style={{
                    ...customStyles.PresetDateRangePicker_panel,
                    ...DayPickerCalendarInfoHorizontal,
                    ...{
                        PresetDateRangePicker_panel: {
                            padding: '0px',
                            width: '200px',
                            height: '100%',
                        },
                        ...customStyles.DayPicker__horizontal,
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
                        <Button text="Apply Time Range" onClick={this.onClickApplyTimeChange} dataTestId="apply-time-range" />
                    </div>
                </div>
                <div className='w-200 p-16 h-300'>
                    {DayPickerRangeControllerPresets.map(({ text, startDate, endDate, endStr }) => {
                        const isSelected =
                            startDate.isSame(this.props.calendar.startDate, 'minute') &&
                            startDate.isSame(this.props.calendar.startDate, 'hour') &&
                            startDate.isSame(this.props.calendar.startDate, 'day') &&
                            endDate.isSame(this.props.calendar.endDate, 'day')
                        let buttonStyles = {
                            ...customStyles.PresetDateRangePicker_button,
                        }
                        if (isSelected) {
                            buttonStyles = {
                                ...buttonStyles,
                                ...customStyles.PresetDateRangePicker_button__selected,
                            }
                        }
                        return (
                            <button
                                type="button"
                                key={text}
                                style={{ ...buttonStyles, textAlign: 'left' }}
                                onClick={this.onClickPredefinedTimeRange(startDate, endDate, endStr)}
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
