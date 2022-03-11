import React from 'react';
import AsyncSelect from 'react-select/async';
import { appListOptions, appSelectorStyle, DropdownIndicator, noOptionsMessage } from './AppSelectorUtil';

interface AppSelectorType {
    onChange: ({ label, value }) => void;
    appId: number;
    appName: string;
}
export default function AppSelector({ onChange, appId, appName }: AppSelectorType) {
    const defaultOption = [{ value: appId, label: appName }];
    let selectedValue = defaultOption[0];
    return (
        <AsyncSelect
            defaultOption
            loadOptions={appListOptions}
            noOptionsMessage={noOptionsMessage}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
                LoadingIndicator: null,
            }}
            value={selectedValue}
            styles={appSelectorStyle}
        />
    );
}
