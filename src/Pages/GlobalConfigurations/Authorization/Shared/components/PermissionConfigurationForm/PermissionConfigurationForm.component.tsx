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

import { RadioGroup, RadioGroupItem, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { PERMISSION_TYPE_LABEL_MAP, PermissionType } from '../../../constants'
import { getIsSuperAdminPermission } from '../../../utils'
import { AppPermissions } from '../AppPermissions'
import SuperAdminInfoBar from '../SuperAdminInfoBar'
import { UserPermissionGroupsSelector } from '../UserPermissionGroupsSelector'
import { usePermissionConfiguration } from './PermissionConfigurationFormProvider'
import { PermissionConfigurationFormProps } from './types'

const ManageAllAccessToggle = importComponentFromFELibrary('ManageAllAccessToggle', null, 'function')

const PermissionConfigurationForm = ({
    showUserPermissionGroupSelector = false,
    hideDirectPermissions = false,
    isAddMode,
}: PermissionConfigurationFormProps) => {
    const {
        permissionType,
        setPermissionType,
        allowManageAllAccess,
        setAllowManageAllAccess,
        isLoggedInUserSuperAdmin,
        canManageAllAccess,
    } = usePermissionConfiguration()
    const isSuperAdminPermission = getIsSuperAdminPermission(permissionType)

    // disable radio for super admin permission
    const isPermissionSelectionDisabled = isAddMode && !(isLoggedInUserSuperAdmin || canManageAllAccess)

    const handlePermissionType = (e) => {
        setPermissionType(e.target.value)
    }

    return (
        <>
            <div className="flex left">
                <RadioGroup
                    className="permission-type__radio-group"
                    value={permissionType}
                    name="permission-type"
                    onChange={handlePermissionType}
                >
                    {Object.entries(PERMISSION_TYPE_LABEL_MAP).map(([value, label]) => {
                        const isSuperAdminRadio = getIsSuperAdminPermission(value as PermissionType)
                        return (
                            <Tooltip
                                alwaysShowTippyOnHover={isSuperAdminRadio && isPermissionSelectionDisabled}
                                content="Cannot manage access of super admins"
                            >
                                <div>
                                    <RadioGroupItem
                                        dataTestId={`${
                                            isSuperAdminRadio ? 'super-admin' : 'specific-user'
                                        }-permission-radio-button`}
                                        value={value}
                                        key={value}
                                        disabled={isPermissionSelectionDisabled}
                                    >
                                        <span
                                            className={`dc__no-text-transform ${permissionType === value ? 'fw-6' : 'fw-4'}`}
                                        >
                                            {label}
                                        </span>
                                    </RadioGroupItem>
                                </div>
                            </Tooltip>
                        )
                    })}
                </RadioGroup>
            </div>
            {isSuperAdminPermission ? (
                <SuperAdminInfoBar />
            ) : (
                <>
                    {showUserPermissionGroupSelector && (
                        <>
                            <UserPermissionGroupsSelector />
                            {!hideDirectPermissions && <div className="dc__border-top" />}
                        </>
                    )}
                    <div
                        className="flexbox-col dc__gap-8"
                        style={
                            hideDirectPermissions
                                ? {
                                      display: 'none',
                                  }
                                : {}
                        }
                    >
                        <div className="flexbox dc__content-space">
                            <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Permissions</h3>
                            {isLoggedInUserSuperAdmin && ManageAllAccessToggle && (
                                <ManageAllAccessToggle
                                    allowManageAllAccess={allowManageAllAccess}
                                    setAllowManageAllAccess={setAllowManageAllAccess}
                                />
                            )}
                        </div>
                        <AppPermissions />
                    </div>
                </>
            )}
        </>
    )
}

export default PermissionConfigurationForm
