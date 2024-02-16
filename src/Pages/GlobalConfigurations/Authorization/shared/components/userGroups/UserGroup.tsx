// TODO (v3): Remove this file

import React, { useMemo } from 'react'
import {
    Option,
    MultiValueContainer,
    MultiValueRemove,
    multiSelectStyles,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { components } from 'react-select'
import { ActionTypes, EntityTypes, ChartPermissionRow } from './userGroups.types'
import { ACCESS_TYPE_MAP } from '../../../../../../config'
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/ic-close.svg'
import { groupHeaderStyle } from '../../../../../../components/v2/common/ReactSelect.utils'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'

const PERMISSION_LABEL_CLASS = 'fw-6 fs-12 cn-7 dc__uppercase mb-0'

export const tempMultiSelectStyles = {
    ...multiSelectStyles,
    ...groupHeaderStyle,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '140%',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

// TODO (v3): This should be from fe-lib
export const APPROVER_ACTION = { label: 'approver', value: 'approver' }
// TODO (v3): This should be from fe-lib
export const CONFIG_APPROVER_ACTION = { label: 'configApprover', value: 'configApprover' }

export const ChartPermission: React.FC<ChartPermissionRow> = React.memo(({ chartGroupsList }) => {
    const { chartPermission, setChartPermission } = usePermissionConfiguration()
    function handleChartCreateChange(event) {
        if (event.target.checked) {
            // set admin
            setChartPermission((chartPermission) => ({
                ...chartPermission,
                action: ActionTypes.ADMIN,
                entityName: [],
            }))
        } else {
            // set view or update
            setChartPermission((chartPermission) => ({
                ...chartPermission,
                action: ActionTypes.VIEW,
                entityName: [],
            }))
        }
    }

    function handleChartEditChange(selected, actionMeta) {
        const { label, value } = selected
        if (value === 'Deny') {
            setChartPermission((chartPermission) => ({
                ...chartPermission,
                action: ActionTypes.VIEW,
                entityName: [],
            }))
        } else {
            setChartPermission((chartPermission) => ({
                ...chartPermission,
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
                style={{ gridTemplateColumns: '80px 80px 200px', rowGap: '5px' }}
            >
                <label className={PERMISSION_LABEL_CLASS}>View</label>
                <label className={PERMISSION_LABEL_CLASS}>Create</label>
                <label className={PERMISSION_LABEL_CLASS}>Edit</label>
                <div>
                    <input type="checkbox" checked disabled className="h-16 w-16" />
                </div>
                <div>
                    <input
                        data-testid="chart-group-create-permission-checkbox"
                        type="checkbox"
                        checked={chartPermission.action === ActionTypes.ADMIN}
                        onChange={handleChartCreateChange}
                        className="h-16 w-16"
                    />
                </div>
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
                    styles={{ ...tempMultiSelectStyles }}
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
                        menu: (base, state) => ({
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
                    onChange={(selected, actionMeta) =>
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

export const projectValueContainer = (props) => {
    const value = props.getValue()
    return (
        <components.ValueContainer {...props}>
            {value[0] ? (
                <>
                    {!props.selectProps.menuIsOpen && value[0].value}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const GroupRow = ({ name, description, removeRow }) => {
    return (
        <>
            <div className="anchor">{name}</div>
            <div className="dc__ellipsis-right">{description}</div>
            <CloseIcon onClick={removeRow} className="pointer" />
        </>
    )
}

export function ParseData(dataList: any[], entity: string, accessType?: string) {
    switch (entity) {
        case EntityTypes.DIRECT:
            if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                return dataList.filter(
                    (role) =>
                        role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && role.value !== CONFIG_APPROVER_ACTION.value,
                )
            }
            return dataList.filter((role) => role.accessType === ACCESS_TYPE_MAP.HELM_APPS)

        case EntityTypes.CLUSTER:
        case EntityTypes.CHART_GROUP:
        case EntityTypes.JOB:
            return dataList.filter((role) => role.entity === entity)
    }
}
