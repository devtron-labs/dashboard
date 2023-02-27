import React from 'react'
import { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { JobSelectorType } from '../Types'
import { appSelectorStyle, jobListOptions } from './JobSelector.utils'

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <DropDownIcon
                className={`rotate`}
                style={{
                    ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg',
                    height: '24px',
                    width: '24px',
                }}
            />
        </components.DropdownIndicator>
    )
}

const noOptionsMessage = (inputObj: { inputValue: string }): string => {
    if (inputObj && (inputObj.inputValue === '' || inputObj.inputValue.length < 3)) {
        return 'Type 3 chars to see matching results'
    }
    return 'No matching results'
}

export default function JobSelector({ onChange, jobId, jobName }: JobSelectorType) {
    const defaultOptions = [{ value: jobId, label: jobName }]

    return (
        <AsyncSelect
            defaultOptions
            loadOptions={jobListOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                LoadingIndicator: null,
                DropdownIndicator,
            }}
            value={defaultOptions[0]}
            styles={appSelectorStyle}
        />
    )
}
