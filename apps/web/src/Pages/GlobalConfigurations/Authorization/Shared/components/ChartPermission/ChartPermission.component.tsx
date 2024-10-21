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

import React, { useMemo } from 'react'
import {
    Option,
    MultiValueContainer,
    MultiValueRemove,
    OptionType,
    Checkbox,
    noop,
    CHECKBOX_VALUE,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { authorizationSelectStyles, ActionTypes } from '../../../constants'
import { ChartPermissionRow } from './types'
import { ChartPermissionValues, CHART_PERMISSION_OPTIONS } from './constants'

const PERMISSION_LABEL_CLASS = 'fw-6 fs-12 cn-7 dc__uppercase'

const ChartPermission = React.memo(({ chartGroupsList }: ChartPermissionRow) => {
    const { chartPermission, setChartPermission } = usePermissionConfiguration()

    const handleChartCreateChange = (event) => {
        if (event.target.checked) {
            // set admin
            setChartPermission((_chartPermission) => ({
                ..._chartPermission,
                action: ActionTypes.ADMIN,
                entityName: [],
            }))
        } else {
            // set view or update
            setChartPermission((_chartPermission) => ({
                ..._chartPermission,
                action: ActionTypes.VIEW,
                entityName: [],
            }))
        }
    }

    const handleChartEditChange = (selected) => {
        const { value } = selected
        if (value === ChartPermissionValues.deny) {
            setChartPermission((_chartPermission) => ({
                ..._chartPermission,
                action: ActionTypes.VIEW,
                entityName: [],
            }))
        } else {
            setChartPermission((_chartPermission) => ({
                ..._chartPermission,
                action: ActionTypes.UPDATE,
                entityName: [],
            }))
        }
    }

    const chartGroupEditOptions: OptionType[] = useMemo(() => {
        if (chartPermission.action === ActionTypes.ADMIN) {
            return [CHART_PERMISSION_OPTIONS[ChartPermissionValues.allCharts]]
        }
        return [
            CHART_PERMISSION_OPTIONS[ChartPermissionValues.deny],
            CHART_PERMISSION_OPTIONS[ChartPermissionValues.specificCharts],
        ]
    }, [chartPermission.action])

    const chartGroupOptions = chartGroupsList?.map((chartGroup) => ({
        label: chartGroup.name,
        value: chartGroup.name,
    }))

    const handleChartGroupChange = (selected) =>
        setChartPermission((_chartPermission) => ({
            ..._chartPermission,
            entityName: selected as OptionType[],
        }))

    const getSelectedValueForChartGroupEditSelect = () => {
        if (chartPermission.action === ActionTypes.ADMIN) {
            return chartGroupEditOptions[0]
        }
        if (chartPermission.action === ActionTypes.VIEW) {
            return CHART_PERMISSION_OPTIONS[ChartPermissionValues.deny]
        }
        return CHART_PERMISSION_OPTIONS[ChartPermissionValues.specificCharts]
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="w-100 display-grid dc__align-items-center chart-permission__row">
                <div className={PERMISSION_LABEL_CLASS}>View</div>
                <div className={PERMISSION_LABEL_CLASS}>Create</div>
                <div className={PERMISSION_LABEL_CLASS}>Edit</div>
                <Checkbox isChecked disabled onChange={noop} rootClassName="mb-0" value={CHECKBOX_VALUE.CHECKED} />
                <Checkbox
                    isChecked={chartPermission.action === ActionTypes.ADMIN}
                    onChange={handleChartCreateChange}
                    rootClassName="mb-0"
                    value={CHECKBOX_VALUE.CHECKED}
                />
                <Select
                    value={getSelectedValueForChartGroupEditSelect()}
                    isDisabled={chartPermission.action === ActionTypes.ADMIN}
                    options={chartGroupEditOptions}
                    onChange={handleChartEditChange}
                    menuPlacement="auto"
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        Option,
                    }}
                    styles={authorizationSelectStyles}
                />
            </div>
            {chartPermission.action === ActionTypes.UPDATE && (
                <Select
                    value={chartPermission.entityName}
                    placeholder="Select Chart Group"
                    isMulti
                    styles={authorizationSelectStyles}
                    closeMenuOnSelect={false}
                    name="entityName"
                    options={chartGroupOptions}
                    onChange={handleChartGroupChange}
                    hideSelectedOptions={false}
                    menuPlacement="auto"
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        MultiValueRemove,
                        MultiValueContainer,
                        Option,
                    }}
                />
            )}
        </div>
    )
})

export default ChartPermission
