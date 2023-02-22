import React from 'react'
import AsyncSelect from 'react-select/async'
import { appSelectorStyle, DropdownIndicator, noOptionsMessage } from '../AppSelector/AppSelectorUtil'
import { EnvSelectorType } from './AppGroup.types'
import { envListOptions } from './AppGroup.utils'

export function EnvSelector({ onChange, envId, envName }: EnvSelectorType) {
    const defaultOptions = { value: envId, label: envName }

    return (
        <AsyncSelect
            loadOptions={envListOptions}
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
