import React, { Component, useState } from 'react'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import CustomizableCalendarDay from 'react-dates/lib/components/CustomizableCalendarDay.js'
import ReactGA from 'react-ga'
import moment, { Moment } from 'moment'
import { isInclusivelyBeforeDay, DateRangePicker, SingleDatePicker } from 'react-dates'
import { noop } from '../helpers/Helpers'
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
        color: '#fff',
    },
}

const selectedSpanStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',
    hover: {
        background: 'var(--B500)',
        color: '#fff',
    },
}

const customDayStyles = {
    selectedStartStyles: selectedStyles,
    selectedEndStyles: selectedStyles,
    hoveredSpanStyles: hoveredSpanStyles,
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
        color: '#06c',
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
                    if (isSelected)
                        buttonStyles = {
                            ...buttonStyles,
                            ...styless.PresetDateRangePicker_button__selected,
                            ...styless.DayPicker_portal__horizontal,
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
                focused
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
                displayFormat={'DD-MM-YYYY'}
                isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())} //enable past dates
                renderCalendarInfo={this.renderDatePresets}
                calendarInfoPosition="before"
                initialVisibleMonth={this.getInitialVisibleMonth}
                renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
                hideKeyboardShortcutsPanel={true}
                numberOfMonths={1}
                block={false}
                small={true}
                withFullScreenPortal={false}
                anchorDirection={'right'}
                orientation={'horizontal'}
                minimumNights={1}
                isDayBlocked={this.handleIsDayBlocked}
            />
        )
    }
}

interface SinglrDatePickerProps {
    date: Moment
    handleDatesChange: (e) => void
    readOnly?: boolean
    isTodayBlocked?: boolean
}

const blockToday = (day: Moment): boolean => {
    return day.isSame(moment(), 'day')
}

export const SingleDatePickerComponent = ({
    date,
    handleDatesChange,
    readOnly,
    isTodayBlocked,
}: SinglrDatePickerProps) => {
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
            openDirection={'down'}
            renderCalendarDay={(props) => <CustomizableCalendarDay {...props} {...customDayStyles} />}
            hideKeyboardShortcutsPanel={true}
            withFullScreenPortal={false}
            orientation={'horizontal'}
            readOnly={readOnly || false}
            isDayBlocked={isTodayBlocked ? blockToday : noop}
        />
    )
}
