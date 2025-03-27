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

import { noop, RadioGroup, Tooltip, UserRoleConfig } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { components } from 'react-select'
import {
    RoleSelectorGroupHeaderProps,
    RoleSelectorGroupHeadingParams,
    RoleSelectorGroupParams,
    RoleSelectorOptionParams,
} from './types'
import { ACCESS_ROLE_OPTIONS_CONTAINER_ID } from './constants'

const ToggleEnableRole = importComponentFromFELibrary('ToggleEnableRole', null, 'function')

export const MANGER_ROLE_DEPRECATION_WARNING = importComponentFromFELibrary(
    'MANGER_ROLE_DEPRECATION_WARNING',
    null,
    'function',
)

export const renderRoleInfoTippy = (label: string, description: string) => (
    <div className="flexbox-col fs-12 lh-18">
        <span className="fw-6">{label}</span>
        <p className="fw-4 mb-0">{description}</p>
        {MANGER_ROLE_DEPRECATION_WARNING && label === 'Manager' && (
            <p className="mt-10">{MANGER_ROLE_DEPRECATION_WARNING}</p>
        )}
    </div>
)

const RoleSelectorGroupHeader = ({ label, showToggle, toggleSelected, onChange }: RoleSelectorGroupHeaderProps) => (
    <div className="flexbox dc__align-items-center dc__content-space px-8 py-6 bg__menu--secondary br-4">
        <span className="fs-13 fw-4 lh-20">{label}</span>
        {ToggleEnableRole && showToggle && <ToggleEnableRole selected={toggleSelected} onChange={onChange} />}
    </div>
)

export const renderGroup = ({ props, baseRoleValue, toggleConfig }: RoleSelectorGroupParams) => {
    const { children, data } = props
    const { label } = data

    if (label === 'Additional role')
        return toggleConfig.baseRole && <components.Group {...props}>{children}</components.Group>

    if (label === 'Base Role') {
        return (
            <components.Group {...props}>
                {toggleConfig.baseRole && (
                    <RadioGroup
                        name="base-role"
                        value={baseRoleValue}
                        onChange={noop}
                        className="flexbox-imp flexbox-col dc__inline-radio-group dc__no-border-imp base-role-selector"
                    >
                        {children}
                    </RadioGroup>
                )}
            </components.Group>
        )
    }
    return (
        <components.Group {...props}>
            {toggleConfig.accessManagerRoles && <div id={ACCESS_ROLE_OPTIONS_CONTAINER_ID}>{children}</div>}
        </components.Group>
    )
}

export const renderGroupHeading = ({
    props,
    showToggle,
    toggleConfig,
    toggleBaseRole,
    toggleAccessManagerRoles,
}: RoleSelectorGroupHeadingParams) => {
    const { data } = props
    const { label } = data
    const { baseRole, accessManagerRoles } = toggleConfig

    if (label === 'Additional role') {
        return (
            <components.GroupHeading {...props} className="pt-4-imp">
                <div className="px-8 py-4 fs-12 lh-20 fw-6">{label}</div>
            </components.GroupHeading>
        )
    }

    if (label === 'Base Role') {
        return (
            <components.GroupHeading {...props}>
                <RoleSelectorGroupHeader
                    label={label}
                    showToggle={showToggle}
                    toggleSelected={baseRole}
                    onChange={toggleBaseRole}
                />
            </components.GroupHeading>
        )
    }

    return (
        <components.GroupHeading {...props} className="pt-4-imp">
            <div className="flexbox-col dc__gap-4">
                <div className="border__secondary--bottom" />
                <Tooltip
                    content={renderRoleInfoTippy(label, 'Can manage access of users with specific roles')}
                    alwaysShowTippyOnHover
                    placement="left"
                >
                    <RoleSelectorGroupHeader
                        label={label}
                        showToggle
                        toggleSelected={accessManagerRoles}
                        onChange={toggleAccessManagerRoles}
                    />
                </Tooltip>
            </div>
        </components.GroupHeading>
    )
}

export const renderOption = ({
    props,
    roleConfig,
    handleUpdateDirectPermissionRoleConfig,
}: RoleSelectorOptionParams) => {
    const { children, data } = props
    const { value, roleType } = data

    const handleUpdateBaseRole = () => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, baseRole: value })
    }

    const handleUpdateAdditionalRoles = (updatedAdditionalRoles: UserRoleConfig['additionalRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, additionalRoles: updatedAdditionalRoles })
    }

    const handleUpdateAccessManagerRoles = (updatedAccessRoles: UserRoleConfig['accessManagerRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, accessManagerRoles: updatedAccessRoles })
    }

    const handleChangeAdditionalOrAccessRole = () => {
        const currentSet = roleType !== 'baseRole' && roleConfig[roleType]
        if (currentSet.has(value)) {
            currentSet.delete(value)
        } else {
            currentSet.add(value)
        }

        if (roleType === 'additionalRoles') {
            handleUpdateAdditionalRoles(currentSet)
            return
        }
        handleUpdateAccessManagerRoles(currentSet)
    }

    return (
        <components.Option {...props}>
            <div
                className="px-8 py-6"
                onClick={roleType === 'baseRole' ? handleUpdateBaseRole : handleChangeAdditionalOrAccessRole}
            >
                {children}
            </div>
        </components.Option>
    )
}
