import React from 'react';
import { useParams, useHistory, generatePath, useRouteMatch } from 'react-router';
import { mapByKey, useAsync } from '../common';
import Select from 'react-select';
import { appSelectorStyle, DropdownIndicator } from './AppSelectorUtil';

interface ChartSelectorType {
    primaryKey: string; //url match
    primaryValue: string;
    matchedKeys: string[];
    api: () => Promise<any>;
    apiPrimaryKey?: string; //primary key to generate map
    onChange?: ({ label, value }) => void;
    formatOptionLabel?: ({ label, value, ...rest }) => React.ReactNode;
    filterOption?: (option: any, searchString: string) => boolean;
}
export default function ChartSelector({
    primaryKey,
    primaryValue,
    matchedKeys,
    api,
    apiPrimaryKey,
    onChange,
    formatOptionLabel = null,
    filterOption = null,
}: ChartSelectorType) {
    const [loading, result, error, reload] = useAsync(api, []);
    const listMap = mapByKey(result?.result || [], apiPrimaryKey || primaryKey);
    const { path } = useRouteMatch();
    const params = useParams();
    const { push } = useHistory();
    const _primaryKey = Number(params[primaryKey]);
    function selectApp(selected) {
        if (onChange) {
            onChange(selected);
            return;
        }
        const keys = listMap.get(selected.value);
        const replacements = [...matchedKeys].reduce((agg, curr) => ({ ...agg, [curr]: keys[curr] }), {});
        const newUrl = generatePath(path, { ...replacements, [primaryKey]: selected.value });
        push(newUrl);
    }
    return (
        <Select
            options={result?.result?.map((res) => ({
                value: res[apiPrimaryKey || primaryKey],
                label: res[primaryValue],
                ...res,
            }))}
            value={{
                value: _primaryKey,
                label: listMap.has(_primaryKey) ? (listMap.get(_primaryKey)[primaryValue] as string) : '',
            }}
            {...(formatOptionLabel ? { formatOptionLabel } : {})}
            {...(filterOption ? { filterOption } : {})}
            onChange={selectApp}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
            styles={appSelectorStyle}
        />
    );
}
