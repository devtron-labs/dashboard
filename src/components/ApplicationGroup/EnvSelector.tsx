import React, { useRef } from 'react'
import AsyncSelect from 'react-select/async'
import { appSelectorStyle, DropdownIndicator, noOptionsMessage } from '../AppSelector/AppSelectorUtil'
import { EnvSelectorType } from './AppGroup.types'
import { envListOptions } from './AppGroup.utils'
import { abortPreviousRequests } from '@devtron-labs/devtron-fe-common-lib'

export const EnvSelector = ({ onChange, envId, envName }: EnvSelectorType) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const defaultOptions = { value: envId, label: envName }

    const handleFetchOptions = (inputValue: string) => {
        return abortPreviousRequests(() => envListOptions(inputValue, abortControllerRef.current.signal), abortControllerRef)
    }

    return (
        <AsyncSelect
            loadOptions={handleFetchOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            value={defaultOptions}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator: null,
            }}
            styles={appSelectorStyle}
        />
    )
}
