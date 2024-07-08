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

import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../../../constants'
import { getIsSuperAdminPermission } from '../../../utils'
import { AppPermissions } from '../AppPermissions'
import SuperAdminInfoBar from '../SuperAdminInfoBar'
import { UserPermissionGroupsSelector } from '../UserPermissionGroupsSelector'
import { usePermissionConfiguration } from './PermissionConfigurationFormProvider'
import { PermissionConfigurationFormProps } from './types'

const PermissionConfigurationForm = ({ showUserPermissionGroupSelector = false }: PermissionConfigurationFormProps) => {
    const { permissionType, setPermissionType } = usePermissionConfiguration()
    const isSuperAdminPermission = getIsSuperAdminPermission(permissionType)

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
                    {Object.entries(PERMISSION_TYPE_LABEL_MAP).map(([value, label]) => (
                        <RadioGroupItem
                            dataTestId={`${
                                getIsSuperAdminPermission(value as PermissionType) ? 'super-admin' : 'specific-user'
                            }-permission-radio-button`}
                            value={value}
                            key={value}
                        >
                            <span className={`dc__no-text-transform ${permissionType === value ? 'fw-6' : 'fw-4'}`}>
                                {label}
                            </span>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
            </div>
            {isSuperAdminPermission ? (
                <SuperAdminInfoBar />
            ) : (
                <>
                    {showUserPermissionGroupSelector && (
                        <>
                            <UserPermissionGroupsSelector />
                            <div className="dc__border-top" />
                        </>
                    )}
                    <div className="flexbox-col dc__gap-8">
                        <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Direct Permissions</h3>
                        <AppPermissions />
                    </div>
                </>
            )}
        </>
    )
}

export default PermissionConfigurationForm
