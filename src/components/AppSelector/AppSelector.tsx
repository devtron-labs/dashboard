import React, { useRef } from 'react'
import AsyncSelect from 'react-select/async'
import { appListOptions, appSelectorStyle, DropdownIndicator, noOptionsMessage } from './AppSelectorUtil'
import { abortPreviousRequests } from '@devtron-labs/devtron-fe-common-lib'

interface AppSelectorType {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
}

export default function AppSelector({ onChange, appId, appName, isJobView }: AppSelectorType) {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const defaultOptions = [{ value: appId, label: appName }]
    const loadAppListOptions = (inputValue: string) =>
        abortPreviousRequests(
            () => appListOptions(inputValue, isJobView, abortControllerRef.current.signal),
            abortControllerRef,
        )

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
