import React from 'react'
import AsyncSelect from 'react-select/async'
import { appListOptions, appSelectorStyle, DropdownIndicator, noOptionsMessage } from './AppSelectorUtil'

interface AppSelectorType {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
}

export default function AppSelector({ onChange, appId, appName, isJobView }: AppSelectorType) {
    const defaultOptions = [{ value: appId, label: appName }]
    const loadAppListOptions = (inputValue: string) => appListOptions(inputValue, isJobView)

    return (
        <AsyncSelect
            defaultOptions
            loadOptions={loadAppListOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator: null,
            }}
            value={defaultOptions[0]}
            styles={appSelectorStyle}
        />
    )
}
