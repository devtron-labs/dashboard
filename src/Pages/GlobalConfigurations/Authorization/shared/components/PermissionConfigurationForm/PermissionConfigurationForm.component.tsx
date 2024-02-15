import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { PermissionType, PERMISSION_TYPE_LABEL_MAP } from '../../../constants'
import { User } from '../../../types'
import AppPermissions from '../AppPermissions'
import SuperAdminInfoBar from '../SuperAdminInfoBar'
import { UserPermissionGroupsSelector } from '../UserPermissionGroupsSelector'
import { PermissionConfigurationFormProps } from './types'

const PermissionConfigurationForm = ({
    permissionType,
    // TODO (v3): Instead add the setter
    handlePermissionType,
    showUserPermissionGroupSelector = false,
    appPermissionProps,
    data,
    userPermissionGroupSelectorProps = {} as PermissionConfigurationFormProps['userPermissionGroupSelectorProps'],
}: PermissionConfigurationFormProps) => {
    const {
        directPermission,
        setDirectPermission,
        chartPermission,
        setChartPermission,
        k8sPermission,
        setK8sPermission,
        currentK8sPermissionRef,
    } = appPermissionProps
    const { userGroups, setUserGroups } = userPermissionGroupSelectorProps
    const isSuperAdminPermission = permissionType === PermissionType.SUPER_ADMIN

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
                            <UserPermissionGroupsSelector
                                // Casting as if showUserPermissionGroupSelector is true than type for data is User
                                userData={data as User}
                                userGroups={userGroups}
                                setUserGroups={setUserGroups}
                            />
                            <div className="dc__border-top-n1" />
                        </>
                    )}
                    <div className="flexbox-col dc__gap-8">
                        <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Direct Permissions</h3>
                        <AppPermissions
                            data={data}
                            directPermission={directPermission}
                            setDirectPermission={setDirectPermission}
                            chartPermission={chartPermission}
                            setChartPermission={setChartPermission}
                            k8sPermission={k8sPermission}
                            setK8sPermission={setK8sPermission}
                            currentK8sPermissionRef={currentK8sPermissionRef}
                        />
                    </div>
                </>
            )}
        </>
    )
}

export default PermissionConfigurationForm
