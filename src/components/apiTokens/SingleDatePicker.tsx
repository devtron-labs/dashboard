import { Moment } from 'moment'
import React, { useState } from 'react'
import { SingleDatePicker } from 'react-dates'

interface SinglrDatePickerProps {
    date: Moment
    handleDatesChange: (e) => void
    focused
    handleFocusChange
}

function SingleDatePickerComponent({ date, handleDatesChange, focused, handleFocusChange }: SinglrDatePickerProps) {
    return (
        <>
            <SingleDatePicker
                date={date} // momentPropTypes.momentObj or null
                onDateChange={handleDatesChange} // PropTypes.func.isRequired
                focused={focused} // PropTypes.bool
                onFocusChange={handleFocusChange}
            />
        </>
    )
}

export default SingleDatePickerComponent
