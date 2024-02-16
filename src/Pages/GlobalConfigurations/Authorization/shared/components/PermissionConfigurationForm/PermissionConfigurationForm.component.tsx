import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../../../constants'
import { AppPermissions } from '../AppPermissions'
import SuperAdminInfoBar from '../SuperAdminInfoBar'
import { UserPermissionGroupsSelector } from '../UserPermissionGroupsSelector'
import { usePermissionConfiguration } from './PermissionConfigurationFormProvider'
import { PermissionConfigurationFormProps } from './types'

const PermissionConfigurationForm = ({ showUserPermissionGroupSelector = false }: PermissionConfigurationFormProps) => {
    const { permissionType, setPermissionType } = usePermissionConfiguration()
    const isSuperAdminPermission = permissionType === PermissionType.SUPER_ADMIN

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
                                value === PermissionType.SPECIFIC ? 'specific-user' : 'super-admin'
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
                            <div className="dc__border-top-n1" />
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
