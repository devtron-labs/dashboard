import React from 'react';
import { showError } from '../common';
import AsyncSelect from 'react-select/async';
import { ServerErrors } from '../../modals/commonTypes';
import { getAppList } from '../app/service';
import { appSelectorStyle, DropdownIndicator } from './AppSelectorUtil';

interface AppSelectorType {
    onChange: ({ label, value }) => void;
    appId: number;
    appName: string;
}
export default function AppSelector({ onChange, appId, appName }: AppSelectorType) {
    const defaultOption = [{ value: appId, label: appName }];
    let selectedValue = defaultOption[0];
    function noOptionsMessage(inputObj: { inputValue: string }): string {
        if (inputObj && (inputObj.inputValue === '' || inputObj.inputValue.length < 3)) {
            return 'Type 3 chars to see matching results';
        }
        return 'No matching results';
    }

    const appListOptions = (inputValue: string): Promise<[]> =>
        new Promise((resolve) => {
            if (inputValue.length < 3) {
                resolve([]);
                return;
            }
            getAppList({
                appNameSearch: inputValue,
                sortBy: 'appNameSort',
                sortOrder: 'ASC',
                size: 50,
            })
                .then((response) => {
                    let appList = [];
                    if (response.result && !!response.result.appContainers) {
                        appList = response.result.appContainers.map((res) => ({
                            value: res['appId'],
                            label: res['appName'],
                            ...res,
                        }));
                    }
                    resolve(appList as []);
                })
                .catch((errors: ServerErrors) => {
                    resolve([]);
                    if (errors.code) {
                        showError(errors);
                    }
                });
        });

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
