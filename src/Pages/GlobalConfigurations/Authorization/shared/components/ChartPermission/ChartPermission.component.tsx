/* eslint-disable no-nested-ternary */

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
import { ActionTypes, ChartPermissionRow } from '../userGroups/userGroups.types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { tempMultiSelectStyles } from '../userGroups/UserGroup'

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
        if (value === 'Deny') {
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
            return [{ label: 'All Chart Groups', value: 'All charts' }]
        }
        return [
            { label: 'Deny', value: 'Deny' },
            { label: 'Specific Chart Groups', value: 'Specific Charts' },
        ]
    }, [chartPermission.action])

    return (
        <>
            <div
                className="w-100 display-grid dc__align-items-center"
                // TODO (v3): use classes
                style={{ gridTemplateColumns: '80px 80px 200px', rowGap: '5px' }}
            >
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
                    value={
                        chartPermission.action === ActionTypes.ADMIN
                            ? chartGroupEditOptions[0]
                            : chartPermission.action === ActionTypes.VIEW
                              ? { label: 'Deny', value: 'Deny' }
                              : { label: 'Specific Chart Groups', value: 'Specific Charts' }
                    }
                    isDisabled={chartPermission.action === ActionTypes.ADMIN}
                    options={chartGroupEditOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handleChartEditChange}
                    menuPlacement="auto"
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        Option,
                    }}
                    styles={tempMultiSelectStyles}
                />
            </div>
            {chartPermission.action === ActionTypes.UPDATE && (
                <Select
                    value={chartPermission.entityName}
                    placeholder="Select Chart Group"
                    isMulti
                    styles={{
                        ...tempMultiSelectStyles,
                        multiValue: (base) => ({
                            ...base,
                            border: `1px solid var(--N200)`,
                            borderRadius: `4px`,
                            background: 'white',
                            height: '30px',
                            margin: '0 8px 0 0',
                            padding: '1px',
                        }),
                        menu: (base) => ({
                            ...base,
                            top: 'auto',
                            width: '100%',
                        }),
                    }}
                    closeMenuOnSelect={false}
                    name="entityName"
                    options={chartGroupsList?.map((chartGroup) => ({
                        label: chartGroup.name,
                        value: chartGroup.name,
                    }))}
                    onChange={(selected) =>
                        setChartPermission((_chartPermission) => ({
                            ..._chartPermission,
                            entityName: selected as OptionType[],
                        }))
                    }
                    className="mt-8 mb-8"
                    classNamePrefix="select"
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
        </>
    )
})

export default ChartPermission
