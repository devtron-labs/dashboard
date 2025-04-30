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

import { useEffect, useState } from 'react'
import {
    RadioGroupItem,
    VisibleModal,
    RadioGroup,
    SelectPicker,
    ComponentSizeType,
    CustomInput,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { SingleDatePicker } from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import moment from 'moment'
import CustomizableCalendarDay from 'react-dates/lib/components/CustomizableCalendarDay'
import { Option } from '../../../../../common/ReactSelect.utils'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-close.svg'
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
        useState<{ label: string; value: string; isDisabled?: boolean }[]>(ALLOW_UNTIL_TIME_OPTIONS)
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
        if (!selected) {
            return
        }

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
        } else if (Number(e.target.value) <= 0) {
            errorString = 'Value must be greater than 0'
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
        setCustomLogFilterOptions((prevState) => ({
            ...prevState,
            [filterTypeRadio]: { ...prevState[filterTypeRadio], value: e.target.value },
        }))
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
                <div className="flexbox-col cn-7">
                    {/* TODO:  */}
                    <div className="dc__required-field mb-6 fs-13">
                        {filterTypeRadio === CUSTOM_LOGS_FILTER.DURATION ? 'View logs for last' : 'Set number of lines'}
                    </div>
                    <div className="flex left dc__align-start">
                        <div className="flex-grow-1">
                            <CustomInput
                                name="range-input"
                                type="number"
                                value={customLogFilterOptions[filterTypeRadio].value}
                                onChange={handleInputChange}
                                onBlur={checkInputError}
                                error={customLogFilterOptions[filterTypeRadio].error}
                                placeholder="Enter value"
                                borderRadiusConfig={{
                                    right: false,
                                }}
                            />
                        </div>
                        <div>
                            {filterTypeRadio === CUSTOM_LOGS_FILTER.DURATION ? (
                                <SelectPicker
                                    options={getDurationUnits()}
                                    onChange={changeTimeUnits}
                                    value={getDurationUnits().find(
                                        (option) => option.value === customLogFilterOptions[filterTypeRadio].unit,
                                    )}
                                    inputId="time-selector"
                                    size={ComponentSizeType.large}
                                    menuSize={ComponentSizeType.xs}
                                    borderRadiusConfig={{
                                        left: false,
                                    }}
                                />
                            ) : (
                                <div className="dc__border h-36 dc__right-radius-4 flex fs-13 flex-justify-start px-16 cn-9 dc__no-shrink">
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
                    <div className="fs-13 fw-4 cn-9 mb-16">All available logs will be shown.</div>
                    <InfoBlock
                        variant="warning"
                        description="Note: It might take longer or result in browser issues for extensive logs."
                    />
                </div>
            )
        case 'since':
            return (
                <div className="flexbox-col cn-7">
                    <div className="dc__required-field mb-6 fs-13">View logs since</div>
                    <div className="flexbox-col">
                        <div className="flex">
                            <SingleDatePicker
                                id="single_date_picker"
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
                                customInputIcon={<CalendarIcon className="icon-dim-16" />}
                                isOutsideRange={(day) => moment().startOf('day').isBefore(day, 'day')}
                                displayFormat="DD MMM YYYY"
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
                                        Option: (props) => <Option {...props} />,
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        control: (base) => ({
                                            ...base,
                                            border: '1px solid var(--N200)',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            flexDirection: 'row-reverse',
                                            boxShadow: 'none',
                                            cursor: 'pointer',
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            padding: '0px 4px',
                                        }),
                                    }}
                                    isOptionDisabled={(option) => option.isDisabled}
                                />
                            </div>
                        </div>
                        <div className="flex mt-4 flex-justify-start">
                            <Info className="icon-dim-16 scn-6" />
                            <div className="ml-4 fs-11 fw-4 cn-7">Browser time zone: {timeZone} </div>
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
                <div className="flex pt-12 pb-12 pl-20 pr-20">
                    <div className="fs-16 fw-6">View Logs</div>
                    <Close className="icon-dim-24 ml-auto cursor" onClick={handleClose} />
                </div>
                <div className="flex h-200 dc__align-start dc__border-bottom-n1 dc__border-top-n1 h-200">
                    <RadioGroup
                        value={filterTypeRadio}
                        name="custom-logs"
                        onChange={handleSelectedRadio}
                        className="custom-logs-radio-group dc__no-shrink"
                    >
                        {CUSTOM_LOGS_OPTIONS.map(({ label, value }) => (
                            <RadioGroupItem value={value}>
                                <span className="custom-selection-radio">{label}</span>
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
                    <button type="button" className="cta cancel h-36 flex mr-12" onClick={handleClose}>
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
