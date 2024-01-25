import React, { useEffect, useState } from 'react'
import {
    RadioGroupItem,
    VisibleModal,
    RadioGroup,
    CustomInput,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { components } from 'react-select'
import { SingleDatePicker } from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import moment, { Moment } from 'moment'
import CustomizableCalendarDay from 'react-dates/lib/components/CustomizableCalendarDay.js'
import { Option } from '../../../../../common/ReactSelect.utils'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-close.svg'
import { ReactComponent as Warn } from '../../../../../../../assets/icons/ic-warning.svg'
import { ReactComponent as CalendarIcon } from '../../../../../../../assets/icons/ic-calendar.svg'
import { ReactComponent as ClockIcon } from '../../../../../../../assets/icons/ic-clock.svg'
import { ReactComponent as Info } from '../../../../../../../assets/icons/ic-info-outline-grey.svg'
import './customLogsDropdown.scss'
import { CustomLogsDropdownProps, InputSelectionProps } from '../../nodeDetail.type'
import { ALLOW_UNTIL_TIME_OPTIONS, CUSTOM_LOGS_OPTIONS } from '../../../../../../../config'
import { excludeFutureTimingsOptions, getDurationUnits, getTimeStamp } from '../../nodeDetail.util'
import { multiSelectStyles } from '../../../../../common/ReactSelectCustomization'
import { customDayStyles } from '../../../../../../common'

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ClockIcon className="icon-dim-16" />
        </components.DropdownIndicator>
    )
}
export const InputForSelectedOption = ({ customLogsOption, setCustomLogsOption }: InputSelectionProps) => {
    const [durationUnits, setDurationUnits] = useState(getDurationUnits()[0])
    const [date, setDate] = useState<Moment>(moment())
    const [input, setInput] = useState(customLogsOption.value)
    const [inputError, setInputError] = useState('')
    const [showUntilTime, setUnitlTime] = useState<{ label: string; value: string; isdisabled?: boolean }>(
        ALLOW_UNTIL_TIME_OPTIONS[0],
    )
    const [untilTimeOptions, setUntilTimeOptions] =
        useState<{ label: string; value: string; isdisabled?: boolean }[]>(ALLOW_UNTIL_TIME_OPTIONS)
    const [focused, setFocused] = useState(false)

    const getNearestTimeOptionBeforeNow = () => {
        let nearestTimeOption
        ALLOW_UNTIL_TIME_OPTIONS.forEach((option) => {
            const today = moment().format('YYYY-MM-DD')
            const dateTimeToCompare = moment(`${today}T${option.value}`)
            if (dateTimeToCompare.isBefore(moment())) {
                nearestTimeOption = option
            }
        })
        setUnitlTime(nearestTimeOption)
        return nearestTimeOption
    }
    const handleFocusChange = ({ focused }) => {
        setFocused(focused)
    }
    useEffect(() => {
        setInputError('')
    }, [customLogsOption])
    useEffect(() => {
        const nearestOption = getNearestTimeOptionBeforeNow()
        const index = ALLOW_UNTIL_TIME_OPTIONS.findIndex((option) => option === nearestOption)
        const newOptions = excludeFutureTimingsOptions(ALLOW_UNTIL_TIME_OPTIONS, index)
        setUntilTimeOptions(newOptions)
    }, [])

    const handleDatesChange = (selected) => {
        setDate(selected)
        setCustomLogsOption({ ...customLogsOption, value: getTimeStamp(selected, showUntilTime.value).toString() })
        if (selected.isSame(moment(), 'day')) {
            const nearestOption = getNearestTimeOptionBeforeNow()
            const index = ALLOW_UNTIL_TIME_OPTIONS.findIndex((option) => option === nearestOption)
            const newOptions = excludeFutureTimingsOptions(ALLOW_UNTIL_TIME_OPTIONS, index)
            setUntilTimeOptions(newOptions)
        } else {
            setUntilTimeOptions(ALLOW_UNTIL_TIME_OPTIONS)
        }
    }
    const handleTimeUntilChange = (selected) => {
        setUnitlTime(selected)
        setCustomLogsOption({ ...customLogsOption, value: getTimeStamp(date, selected.value).toString() })
    }

    const checkRequiredError = (e) => {
        if (e.target.value === '') {
            setInputError('This field is required')
        } else if (inputError) {
            setInputError('')
        }
    }

    const offset = moment(new Date()).format('Z')
    const timeZone = `${Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? ''} (GMT ${offset})`

    switch (customLogsOption.option) {
        case 'duration':
        case 'lines':
            return (
                <div className="flexbox-col">
                    <div className="dc__required-field mb-6 fs-13 fcn-7">
                        {customLogsOption.option === 'duration' ? 'View logs for last' : 'Set number of lines'}
                    </div>
                    <div className="flex dc__align-start">
                        <div className="w-180">
                            <CustomInput
                                error={inputError}
                                name="duration-lines"
                                disabled={!!inputError}
                                handleOnBlur={checkRequiredError}
                                value={input}
                                rootClassName="input-focus-none"
                                onChange={(e) => {
                                    checkRequiredError(e)
                                    setInput(e.target.value)
                                    setCustomLogsOption({ ...customLogsOption, value: e.target.value })
                                }}
                            />
                        </div>
                        <div className="flex-grow-1">
                            {customLogsOption.option === 'duration' ? (
                                <Select
                                    options={getDurationUnits()}
                                    onChange={(selected) => {
                                        setDurationUnits(selected)
                                        setCustomLogsOption({ ...customLogsOption, unit: selected.value })
                                    }}
                                    value={durationUnits}
                                    styles={{
                                        ...multiSelectStyles,
                                        control: (base) => ({
                                            ...base,
                                            border: '1px solid var(--N200)',
                                            borderRadius: '0 4px 4px 0',
                                            boxShadow: 'none',
                                            cursor: 'pointer',
                                        }),
                                    }}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: (props) => <Option {...props} showTippy style={{ direction: 'rtl' }} />,
                                    }}
                                />
                            ) : (
                                <div className="dc__border h-38 dc__right-radius-4 flex fs-13 flex-justify-start pl-8">
                                    Lines
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        case 'all':
            return (
                <div className="flexbox-col">
                    <div className="fs-13 fw-4 fcn-9 mb-16">All available logs will be shown.</div>
                    <InfoColourBar
                        classname="warn"
                        Icon={Warn}
                        message="Note: It might take longer or result in browser issues for extensive logs."
                        iconClass="warning-icon"
                    />
                </div>
            )
        case 'since':
            return (
                <div className="flexbox-col">
                    <div className="dc__required-field mb-6 fs-13 fcn-7">View logs since</div>
                    <div className="flexbox-col">
                        <div className="flex">
                            <SingleDatePicker
                                placeholder="Select date"
                                focused={focused}
                                onFocusChange={handleFocusChange}
                                date={date}
                                onDateChange={handleDatesChange}
                                numberOfMonths={1}
                                openDirection="down"
                                renderCalendarDay={(props) => (
                                    <CustomizableCalendarDay {...props} {...customDayStyles} />
                                )}
                                hideKeyboardShortcutsPanel
                                withFullScreenPortal={false}
                                orientation="horizontal"
                                customInputIcon={<CalendarIcon className="icon-dim-20" />}
                                isOutsideRange={(day) => moment().startOf('day').isBefore(day, 'day')}
                            />
                            <div className="flex-grow-1">
                                <Select
                                    placeholder="Select time"
                                    options={untilTimeOptions}
                                    value={showUntilTime}
                                    onChange={handleTimeUntilChange}
                                    menuPlacement="bottom"
                                    isSearchable={false}
                                    components={{
                                        IndicatorSeparator: null,
                                        ClearIndicator: null,
                                        DropdownIndicator,
                                    }}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            border: '1px solid var(--N200)',
                                            borderRadius: '4px',
                                            boxShadow: 'none',
                                            cursor: 'pointer',
                                        }),
                                    }}
                                    isOptionDisabled={(option) => option.isdisabled}
                                />
                            </div>
                        </div>
                        <div className="flex mt-4 flex-justify-start">
                            <Info className="icon-dim-16" />
                            <div className="ml-4 fs-11 fw-4 fcn-7">Browser time zone: {timeZone} </div>
                        </div>
                    </div>
                </div>
            )
        default:
            return null
    }
}
const CustomLogsDropdown = ({
    setCustomLogsOption,
    customLogsOption,
    setLogsShownOption,
    setNewFilteredLogs,
    setShowCustomOptions,
    onLogsCleared,
}: CustomLogsDropdownProps) => {
    const handleClose = () => {
        setLogsShownOption((prevValue) => ({ prev: prevValue.prev, current: prevValue.prev }))
        setShowCustomOptions(false)
    }
    const handleSelectedFilter = () => {
        setShowCustomOptions(false)
        onLogsCleared()
        setNewFilteredLogs(true)
    }

    return (
        <VisibleModal className="">
            <div className="custom-logs-modal w-500 br-4">
                <div className="flex dc__border-bottom-n1 pt-12 pb-12 pl-20 pr-20">
                    <div className="fs-16 fw-6">View Logs</div>
                    <Close className="icon-dim-24 ml-auto cursor" onClick={handleClose} />
                </div>
                <div className="flex dc__border-bottom-n1">
                    <RadioGroup
                        value={customLogsOption.option}
                        name="custom-logs"
                        onChange={(event) => {
                            setCustomLogsOption({ option: event.target.value, value: '' })
                        }}
                        className="custom-logs-radio-group dc__no-shrink"
                    >
                        {CUSTOM_LOGS_OPTIONS.map(({ label, value }) => (
                            <RadioGroupItem value={value}>
                                <span>{label}</span>
                            </RadioGroupItem>
                        ))}
                    </RadioGroup>
                    <div className="option-input-container flex-grow-1">
                        <InputForSelectedOption
                            customLogsOption={customLogsOption}
                            setCustomLogsOption={setCustomLogsOption}
                        />
                    </div>
                </div>
                <div className="flex flex-justify-end pt-16 pb-16 pl-20 pr-20">
                    <button type="button" className="cta cancel h-36 flex mr-16" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type="button" className="cta h-36 flex" onClick={handleSelectedFilter}>
                        Done
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
export default CustomLogsDropdown
