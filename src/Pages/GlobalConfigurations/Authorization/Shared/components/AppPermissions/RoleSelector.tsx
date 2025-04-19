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

import { useMemo, useState } from 'react'
import Select, { GroupHeadingProps, GroupProps, OptionProps } from 'react-select'

import {
    ACCESS_TYPE_MAP,
    ActionTypes,
    Checkbox,
    CHECKBOX_VALUE,
    Icon,
    noop,
    RadioGroupItem,
    RoleSelectorOptionType,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { useAuthorizationContext } from '@Pages/GlobalConfigurations/Authorization/AuthorizationProvider'

import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { ACCESS_ROLE_OPTIONS_CONTAINER_ID } from './constants'
import { renderGroup, renderGroupHeading, renderOption, renderRoleInfoTippy } from './roleSelectorHelpers'
import { RoleSelectorProps, RoleSelectorToggleConfig } from './types'
import { getDefaultRolesToggleConfig, getRoleOptions, getRoleSelectorStyles, getSelectedRolesText } from './utils'

import './roleSelectorStyles.scss'

const DeprecatedTag = importComponentFromFELibrary('DeprecatedTag', null, 'function')

const RoleSelector = ({ permission, handleUpdateDirectPermissionRoleConfig }: RoleSelectorProps) => {
    const { customRoles } = useAuthorizationContext()
    const { allowManageAllAccess, isLoggedInUserSuperAdmin, canManageAllAccess, hasManagerPermissions } =
        usePermissionConfiguration()
    const { accessType, roleConfig, team, roleConfigError } = permission
    const [toggleConfig, setToggleConfig] = useState<RoleSelectorToggleConfig>(getDefaultRolesToggleConfig(roleConfig))

    const toggleBaseRole = () => {
        setToggleConfig((prev) => {
            if (prev.baseRole) {
                handleUpdateDirectPermissionRoleConfig({
                    ...roleConfig,
                    baseRole: '',
                    additionalRoles: new Set(),
                })
            } else {
                handleUpdateDirectPermissionRoleConfig({
                    ...roleConfig,
                    baseRole: 'view',
                })
            }
            return { ...prev, baseRole: !prev.baseRole }
        })
    }

    const toggleAccessManagerRoles = () => {
        setToggleConfig((prev) => {
            // On toggling off clear selected roles
            if (prev.accessManagerRoles) {
                handleUpdateDirectPermissionRoleConfig({ ...roleConfig, accessManagerRoles: new Set() })
            } else {
                try {
                    // Need to set timeout as element is rendered in dom after state is set
                    setTimeout(() => {
                        const element = document.getElementById(ACCESS_ROLE_OPTIONS_CONTAINER_ID)
                        element.scrollIntoView({ behavior: 'smooth', block: 'end' })
                    }, 100)
                } catch {
                    // do nothing
                }
            }
            return { ...prev, accessManagerRoles: !prev.accessManagerRoles }
        })
    }

    const selectText = useMemo(() => {
        const baseRole =
            customRoles.customRoles.find(
                (role) => role.accessType === accessType && role.roleName === roleConfig.baseRole,
            )?.roleDisplayName || ''

        return getSelectedRolesText(baseRole, roleConfig, allowManageAllAccess)
    }, [roleConfig, allowManageAllAccess])

    const GroupHeading = (props: GroupHeadingProps) =>
        renderGroupHeading({
            props,
            toggleConfig,
            toggleBaseRole,
            toggleAccessManagerRoles,
            showToggle: isLoggedInUserSuperAdmin && accessType === ACCESS_TYPE_MAP.DEVTRON_APPS,
        })

    const Group = (props: GroupProps) =>
        renderGroup({
            props,
            baseRoleValue: roleConfig.baseRole,
            toggleConfig,
        })

    const Option = (props: OptionProps<RoleSelectorOptionType>) =>
        renderOption({ props, roleConfig, handleUpdateDirectPermissionRoleConfig })

    const groupedOptions = useMemo(
        () =>
            getRoleOptions({
                customRoles: customRoles.customRoles,
                accessType,
                showAccessRoles: isLoggedInUserSuperAdmin && !allowManageAllAccess,
                showDeploymentApproverRole: canManageAllAccess || hasManagerPermissions || isLoggedInUserSuperAdmin,
            }),
        [
            customRoles,
            accessType,
            isLoggedInUserSuperAdmin,
            allowManageAllAccess,
            canManageAllAccess,
            hasManagerPermissions,
        ],
    )

    const formatOptionLabel = ({ value, label, description, roleType }: RoleSelectorOptionType) => {
        const isRoleSelected: boolean = roleType !== 'baseRole' && roleConfig[roleType].has(value)

        return (
            <Tooltip
                content={renderRoleInfoTippy(label as string, description as string)}
                alwaysShowTippyOnHover
                placement="left"
            >
                {roleType === 'baseRole' ? (
                    <div className="flexbox dc__align-items-center">
                        <RadioGroupItem value={value}>
                            <div className="flexbox dc__align-items-center dc__gap-8 fs-13 lh-20">
                                <span>{label}</span>
                                {value === ActionTypes.MANAGER && DeprecatedTag && <DeprecatedTag />}
                            </div>
                        </RadioGroupItem>
                    </div>
                ) : (
                    <div className="flexbox dc__align-items-center">
                        <Checkbox
                            isChecked={isRoleSelected}
                            onChange={noop}
                            value={CHECKBOX_VALUE.CHECKED}
                            rootClassName="mb-0"
                        />
                        <span>{label}</span>
                    </div>
                )}
            </Tooltip>
        )
    }

    const roleSelectorStyles = useMemo(() => getRoleSelectorStyles(roleConfigError), [roleConfigError])

    return (
        <div className="flexbox-col dc__gap-4">
            <Select<RoleSelectorOptionType, true>
                formatOptionLabel={formatOptionLabel}
                options={groupedOptions}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    Group,
                    Option,
                    GroupHeading,
                }}
                styles={roleSelectorStyles}
                closeMenuOnSelect={false}
                isSearchable={false}
                placeholder={selectText}
                menuPlacement="auto"
                isDisabled={!team}
                hideSelectedOptions={false}
                isMulti
                controlShouldRenderValue={false}
            />
            {roleConfigError && (
                <div className="flexbox dc__align-items-center dc__gap-4">
                    <Icon name="ic-error" size={16} color={null} />
                    <span className="cr-5 fs-11 lh-16 fw-4">Required</span>
                </div>
            )}
        </div>
    )
}

export default RoleSelector
