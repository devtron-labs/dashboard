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
import { ACCESS_TYPE_MAP, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import Select, { components, MenuListProps, ValueContainerProps } from 'react-select'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { CONFIG_APPROVER_ACTION, ARTIFACT_PROMOTER_ACTION, TERMINAL_EXEC_ACTION } from '../../../constants'
import { roleSelectStyles } from './constants'
import { getPrimaryRoleIndex, parseData } from '../../../utils'
import { DirectPermissionRowProps } from './types'

const ApproverPermission = importComponentFromFELibrary('ApproverPermission')

const RoleSelector = ({
    permission,
    handleDirectPermissionChange,
}: Pick<DirectPermissionRowProps, 'permission' | 'handleDirectPermissionChange'>) => {
    const { customRoles } = useAuthorizationContext()

    const possibleRoles = useMemo(
        () =>
            customRoles.customRoles.map(({ roleDisplayName, roleName, roleDescription, entity, accessType }) => ({
                label: roleDisplayName,
                value: roleName,
                description: roleDescription,
                entity,
                accessType,
            })),
        [customRoles],
    )

    // creating a multiRole array since we receive , binded values from the backend and after one action, we reset that
    const multiRole = permission.action.value.split(',')
    const doesConfigApproverRoleExist = multiRole.includes(CONFIG_APPROVER_ACTION.value)
    const doesArtifactPromoterRoleExist = multiRole.includes(ARTIFACT_PROMOTER_ACTION.value)
    const doesTerminalAccessRoleExist = multiRole.includes(TERMINAL_EXEC_ACTION.value)

    const primaryActionRoleIndex = getPrimaryRoleIndex(multiRole, [
        CONFIG_APPROVER_ACTION.value,
        ARTIFACT_PROMOTER_ACTION.value,
        TERMINAL_EXEC_ACTION.value,
    ])

    const primaryActionRole = {
        label: multiRole[primaryActionRoleIndex],
        value: multiRole[primaryActionRoleIndex],
        configApprover: doesConfigApproverRoleExist || permission.action.configApprover,
        artifactPromoter: doesArtifactPromoterRoleExist || permission.action.artifactPromoter,
        terminalExec: doesTerminalAccessRoleExist || permission.action.terminalExec,
    }

    const getSelectedRolesDisplay = (selectedPermissions: string[]) =>
        selectedPermissions.filter((selectedVal) => !!selectedVal).join(', ')

    const _getMetaRolesForAccessType = () => {
        switch (permission.accessType) {
            case ACCESS_TYPE_MAP.DEVTRON_APPS:
                return customRoles.possibleRolesMeta
            case ACCESS_TYPE_MAP.HELM_APPS:
                return customRoles.possibleRolesMetaForHelm
            case ACCESS_TYPE_MAP.JOBS:
                return customRoles.possibleRolesMetaForJob
            default:
                throw new Error(`Unknown access type ${permission.accessType}`)
        }
    }

    const metaRolesForAccessType = _getMetaRolesForAccessType()

    // eslint-disable-next-line react/no-unstable-nested-components
    const RoleValueContainer = ({ children, getValue, ...props }: ValueContainerProps<SelectPickerOptionType>) => {
        const [{ value }] = getValue()

        return (
            <components.ValueContainer
                {...{
                    getValue,
                    ...props,
                }}
            >
                {getSelectedRolesDisplay([
                    value === SELECT_ALL_VALUE ? 'Admin' : metaRolesForAccessType[value].value,
                    ...(ApproverPermission
                        ? [
                              (permission.approver ||
                                  primaryActionRole.configApprover ||
                                  primaryActionRole.artifactPromoter) &&
                                  'Approver',
                              primaryActionRole.terminalExec && 'Terminal',
                          ]
                        : []),
                ])}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }

    const formatOptionLabel = ({ value }) => (
        <div className="flex left column">
            <span>{metaRolesForAccessType[value]?.value}</span>
            <small className="light-color">{metaRolesForAccessType[value]?.description}</small>
        </div>
    )

    // eslint-disable-next-line react/no-unstable-nested-components
    const RoleMenuList = (props: MenuListProps) => {
        const {
            children,
            selectOption,
            selectProps: { value },
        } = props

        return (
            <components.MenuList {...props}>
                {children}
                {ApproverPermission &&
                    (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS ||
                        permission.accessType === ACCESS_TYPE_MAP.HELM_APPS) && (
                        <ApproverPermission
                            optionProps={props}
                            approver={permission.approver}
                            configApprover={primaryActionRole.configApprover}
                            artifactPromoter={primaryActionRole.artifactPromoter}
                            terminalExec={primaryActionRole.terminalExec}
                            handleDirectPermissionChange={(...rest) => {
                                selectOption(value)
                                handleDirectPermissionChange(...rest)
                            }}
                            formatOptionLabel={formatOptionLabel}
                            accessType={permission.accessType}
                            customRoles={customRoles}
                        />
                    )}
            </components.MenuList>
        )
    }

    return (
        <Select
            classNamePrefix="dropdown-for-role"
            value={primaryActionRole}
            name="action"
            placeholder="Select role"
            options={parseData(possibleRoles, permission.entity, permission.accessType)}
            formatOptionLabel={formatOptionLabel}
            onChange={handleDirectPermissionChange}
            isDisabled={!permission.team}
            menuPlacement="auto"
            blurInputOnSelect
            styles={roleSelectStyles}
            components={{
                ClearIndicator: null,
                IndicatorSeparator: null,
                ValueContainer: RoleValueContainer,
                MenuList: RoleMenuList,
            }}
        />
    )
}

export default RoleSelector
