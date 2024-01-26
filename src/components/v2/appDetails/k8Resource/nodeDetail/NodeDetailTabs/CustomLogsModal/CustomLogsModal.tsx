import React, { useEffect, useState } from 'react'
import {
    RadioGroupItem,
    VisibleModal,
    RadioGroup,
    CustomInput,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { SingleDatePicker } from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import moment from 'moment'
import CustomizableCalendarDay from 'react-dates/lib/components/CustomizableCalendarDay'
import { Option } from '../../../../../common/ReactSelect.utils'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-close.svg'
import { ReactComponent as Warn } from '../../../../../../../assets/icons/ic-warning.svg'
import { ReactComponent as CalendarIcon } from '../../../../../../../assets/icons/ic-calendar.svg'
import { ReactComponent as ClockIcon } from '../../../../../../../assets/icons/ic-clock.svg'
import { ReactComponent as Info } from '../../../../../../../assets/icons/ic-info-outline-grey.svg'
import './customLogsModal.scss'
import { CustomLogsModalProps, InputSelectionProps } from '../../nodeDetail.type'
import { ALLOW_UNTIL_TIME_OPTIONS, CUSTOM_LOGS_FILTER, CUSTOM_LOGS_OPTIONS } from '../../../../../../../config'
import {
    excludeFutureTimingsOptions,
    getDurationUnits,
    getTimeFromTimestamp,
    getTimeStamp,
} from '../../nodeDetail.util'
import { multiSelectStyles } from '../../../../../common/ReactSelectCustomization'
import { customDayStyles } from '../../../../../../common'
import { CustomLogFilterOptionsType, SelectedCustomLogFilterType } from '../node.type'

const DropdownIndicator = () => {
    return <ClockIcon className="icon-dim-16 ml-8" />
}

const getNearestTimeOptionBeforeNow = () => {
    let nearestTimeOption
    ALLOW_UNTIL_TIME_OPTIONS.forEach((option) => {
        const today = moment().format('YYYY-MM-DD')
        const dateTimeToCompare = moment(`${today}T${option.value}`)
        if (dateTimeToCompare.isBefore(moment())) {
            nearestTimeOption = option
        }
    })
    return nearestTimeOption
}
export const InputForSelectedOption = ({
    customLogFilterOptions,
    setCustomLogFilterOptions,
    filterTypeRadio,
}: InputSelectionProps): JSX.Element => {
    const [untilTimeOptions, setUntilTimeOptions] =
        useState<{ label: string; value: string; isdisabled?: boolean }[]>(ALLOW_UNTIL_TIME_OPTIONS)
    const [focused, setFocused] = useState(false)
    const handleFocusChange = ({ focused: isFocused }) => {
        setFocused(isFocused)
    }

    const setUntilTimeOptionsWithExcluded = () => {
        const nearestOption = getNearestTimeOptionBeforeNow()
        const index = ALLOW_UNTIL_TIME_OPTIONS.findIndex((option) => option === nearestOption)
        const newOptions = excludeFutureTimingsOptions(ALLOW_UNTIL_TIME_OPTIONS, index)
        setUntilTimeOptions(newOptions)
    }

    useEffect(() => {
        if (customLogFilterOptions[CUSTOM_LOGS_FILTER.SINCE].date.isSame(moment(), 'day')) {
            setUntilTimeOptionsWithExcluded()
        }
    }, [])

    const handleDatesChange = (selected) => {
        setCustomLogFilterOptions({
            ...customLogFilterOptions,
            [filterTypeRadio]: {
                ...customLogFilterOptions[filterTypeRadio],
                date: selected,
                value: getTimeStamp(selected, customLogFilterOptions[filterTypeRadio].time.value).toString(),
            },
        })
        if (selected.isSame(moment(), 'day')) {
            setUntilTimeOptionsWithExcluded()
        } else {
            setUntilTimeOptions(ALLOW_UNTIL_TIME_OPTIONS)
        }
    }
    const handleTimeUntilChange = (selected) => {
        setCustomLogFilterOptions({
            ...customLogFilterOptions,
            [filterTypeRadio]: {
                ...customLogFilterOptions[filterTypeRadio],
                time: selected,
                value: getTimeStamp(customLogFilterOptions[filterTypeRadio].date, selected.value).toString(),
            },
        })
    }

    const checkInputError = (e) => {
        let errorString
        if (e.target.value === '') {
            errorString = 'This field is required'
        } else if (Number.isNaN(Number(e.target.value))) {
            errorString = 'Please enter a valid number'
        } else if (customLogFilterOptions[filterTypeRadio].error) {
            errorString = ''
        }
        setCustomLogFilterOptions({
            ...customLogFilterOptions,
            [filterTypeRadio]: { ...customLogFilterOptions[filterTypeRadio], error: errorString },
        })
    }

    const handleInputChange = (e) => {
        checkInputError(e)
        setCustomLogFilterOptions({
            ...customLogFilterOptions,
            [filterTypeRadio]: { ...customLogFilterOptions[filterTypeRadio], value: e.target.value },
        })
    }
    const changeTimeUnits = (selected) => {
        setCustomLogFilterOptions({
            ...customLogFilterOptions,
            [filterTypeRadio]: { ...customLogFilterOptions[filterTypeRadio], unit: selected.value },
        })
    }

    const offset = moment(new Date()).format('Z')
    const timeZone = `${Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? ''} (GMT ${offset})`

    switch (filterTypeRadio) {
        case CUSTOM_LOGS_FILTER.DURATION:
        case CUSTOM_LOGS_FILTER.LINES:
            return (
                <div className="flexbox-col">
                    <div className="dc__required-field mb-6 fs-13 fcn-7">
                        {filterTypeRadio === CUSTOM_LOGS_FILTER.DURATION ? 'View logs for last' : 'Set number of lines'}
                    </div>
                    <div className="flex dc__align-start">
                        <div className="w-180">
                            <CustomInput
                                error={customLogFilterOptions[filterTypeRadio].error}
                                name="duration-lines"
                                handleOnBlur={checkInputError}
                                value={customLogFilterOptions[filterTypeRadio].value}
                                rootClassName="input-focus-none"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex-grow-1">
                            {filterTypeRadio === CUSTOM_LOGS_FILTER.DURATION ? (
                                <Select
                                    options={getDurationUnits()}
                                    onChange={changeTimeUnits}
                                    value={getDurationUnits().find(
                                        (option) => option.value === customLogFilterOptions[filterTypeRadio].unit,
                                    )}
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
                                date={customLogFilterOptions[filterTypeRadio].date}
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
                                    value={customLogFilterOptions[filterTypeRadio].time}
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
                                            display: 'flex',
                                            flexDirection: 'row-reverse',
                                            border: '1px solid var(--N200)',
                                            borderRadius: '4px',
                                            boxShadow: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: 'var(--N50)',
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            padding: '0px 4px',
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

const intialiseState = (selectedCustomLogFilter: SelectedCustomLogFilterType) => {
    const selectedOption = selectedCustomLogFilter.option
    const initialState = {
        [CUSTOM_LOGS_FILTER.DURATION]: {
            value: selectedOption === CUSTOM_LOGS_FILTER.DURATION ? selectedCustomLogFilter.value : '',
            unit: selectedOption === CUSTOM_LOGS_FILTER.DURATION ? selectedCustomLogFilter.unit : 'minutes',
            error: '',
        },
        [CUSTOM_LOGS_FILTER.LINES]: {
            value: selectedOption === CUSTOM_LOGS_FILTER.LINES ? selectedCustomLogFilter.value : '',
            error: '',
        },
        [CUSTOM_LOGS_FILTER.SINCE]: {
            value:
                selectedOption === CUSTOM_LOGS_FILTER.SINCE
                    ? selectedCustomLogFilter.value
                    : getTimeStamp(moment(), getNearestTimeOptionBeforeNow().value).toString(),
            date: selectedOption === CUSTOM_LOGS_FILTER.SINCE ? moment.unix(+selectedCustomLogFilter.value) : moment(),
            time:
                selectedOption === CUSTOM_LOGS_FILTER.SINCE
                    ? getTimeFromTimestamp(selectedCustomLogFilter.value)
                    : getNearestTimeOptionBeforeNow(),
        },
        [CUSTOM_LOGS_FILTER.ALL]: {
            value: selectedOption === CUSTOM_LOGS_FILTER.ALL ? selectedCustomLogFilter.value : 'all',
        },
    }
    return initialState
}

const CustomLogsModal = ({
    selectedCustomLogFilter,
    setSelectedCustomLogFilter,
    setLogsShownOption,
    setNewFilteredLogs,
    onLogsCleared,
    setShowCustomOptionsMoadal,
}: CustomLogsModalProps): JSX.Element => {
    const [customLogFilterOptions, setCustomLogFilterOptions] = useState<CustomLogFilterOptionsType>(
        intialiseState(selectedCustomLogFilter),
    )
    const [filterTypeRadio, setFilterTypeRadio] = useState(selectedCustomLogFilter.option)

    const handleClose = () => {
        setLogsShownOption((prevValue) => ({ prev: prevValue.prev, current: prevValue.prev }))
        setShowCustomOptionsMoadal(false)
    }

    const handleSubmitSelectedFilter = () => {
        setShowCustomOptionsMoadal(false)
        onLogsCleared()
        setNewFilteredLogs(true)
        setSelectedCustomLogFilter({
            option: filterTypeRadio,
            value: customLogFilterOptions[filterTypeRadio].value,
            ...(customLogFilterOptions[filterTypeRadio].unit && { unit: customLogFilterOptions[filterTypeRadio].unit }),
        })
    }

    const handleSelectedRadio = (event) => {
        setFilterTypeRadio(event.target.value)
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
                        value={filterTypeRadio}
                        name="custom-logs"
                        onChange={handleSelectedRadio}
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
                            customLogFilterOptions={customLogFilterOptions}
                            setCustomLogFilterOptions={setCustomLogFilterOptions}
                            filterTypeRadio={filterTypeRadio}
                        />
                    </div>
                </div>
                <div className="flex flex-justify-end pt-16 pb-16 pl-20 pr-20">
                    <button type="button" className="cta cancel h-36 flex mr-16" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="cta h-36 flex"
                        onClick={handleSubmitSelectedFilter}
                        disabled={
                            customLogFilterOptions[filterTypeRadio].error ||
                            !customLogFilterOptions[filterTypeRadio].value
                        }
                    >
                        Done
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
export default CustomLogsModal
