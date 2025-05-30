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

import { useState } from 'react'

import {
    ACCESS_TYPE_MAP,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    capitalizeFirstLetter,
    ComponentSizeType,
    EntityTypes,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
    UserRoleConfig,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as TrashIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { HELM_APP_UNASSIGNED_PROJECT } from '../../../../../../config'
import { getIsStatusDropdownDisabled } from '../../../libUtils'
import { DirectPermissionsRoleFilter } from '../../../types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import AppOrJobSelector from './AppOrJobSelector'
import { DirectPermissionFieldName } from './constants'
import EnvironmentSelector from './EnvironmentSelector'
import JobRoleSelector from './JobRoleSelector'
import RoleSelector from './RoleSelector'
import { DirectPermissionRowProps, WorkflowListType } from './types'
import WorkflowSelector from './WorkflowSelector'

const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const DirectPermission = ({
    permission,
    handleDirectPermissionChange,
    index,
    removeRow,
    appsList,
    jobsList,
    appsListHelmApps,
    projectsList,
    getEnvironmentOptions,
    environmentClusterOptions,
    getListForAccessType,
}: DirectPermissionRowProps) => {
    const { setDirectPermission, allowManageAllAccess } = usePermissionConfiguration()
    const [workflowList, setWorkflowList] = useState<WorkflowListType>({ loading: false, options: [] })

    const { showStatus, userStatus } = usePermissionConfiguration()
    const isAccessTypeJob = permission.accessType === ACCESS_TYPE_MAP.JOBS

    const handleStatusChange = (
        status: DirectPermissionsRoleFilter['status'],
        timeToLive?: DirectPermissionsRoleFilter['timeToLive'],
    ) => {
        handleDirectPermissionChange(
            {
                status,
                timeToLive,
            },
            {
                name: DirectPermissionFieldName.status,
            },
        )
    }

    const handleUpdateDirectPermissionRoleConfig = (updatedRoleConfig: UserRoleConfig) => {
        const { baseRole, accessManagerRoles } = updatedRoleConfig
        setDirectPermission((prevPermissions) => {
            const tempPermissions = [...structuredClone(prevPermissions)]
            tempPermissions[index].roleConfig = updatedRoleConfig

            tempPermissions[index].roleConfigError =
                !baseRole && (allowManageAllAccess ? true : !accessManagerRoles.size)

            return tempPermissions
        })
    }

    const projectOptions: SelectPickerOptionType[] = [
        ...(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
            ? [
                  {
                      name: HELM_APP_UNASSIGNED_PROJECT,
                      description: 'Apps without an assigned project',
                  },
              ]
            : []),
        ...projectsList[permission.accessType],
    ].map((project) => ({
        label: project.name === HELM_APP_UNASSIGNED_PROJECT ? capitalizeFirstLetter(project.name) : project.name,
        value: project.name,
    }))

    const formatProjectOptionLabel: SelectPickerProps['formatOptionLabel'] = (option) =>
        option.label === HELM_APP_UNASSIGNED_PROJECT ? (
            <span className="dc__first-letter-capitalize dc__inline-block">{option.label}</span>
        ) : (
            option.label
        )

    return (
        <>
            <SelectPicker
                inputId="dropdown-for-project"
                value={permission.team}
                name={DirectPermissionFieldName.team}
                placeholder="Select project"
                options={projectOptions}
                onChange={handleDirectPermissionChange}
                size={ComponentSizeType.large}
                formatOptionLabel={formatProjectOptionLabel}
            />

            <div style={{ order: isAccessTypeJob ? 3 : 0 }}>
                <EnvironmentSelector
                    environmentClusterOptions={environmentClusterOptions}
                    getEnvironmentOptions={getEnvironmentOptions}
                    handleDirectPermissionChange={handleDirectPermissionChange}
                    permission={permission}
                />
            </div>
            <div style={{ order: isAccessTypeJob ? 1 : 0 }}>
                <AppOrJobSelector
                    permission={permission}
                    handleDirectPermissionChange={handleDirectPermissionChange}
                    getListForAccessType={getListForAccessType}
                    projectsList={projectsList}
                    appsList={appsList}
                    jobsList={jobsList}
                    appsListHelmApps={appsListHelmApps}
                    setWorkflowList={setWorkflowList}
                />
            </div>
            {permission.entity === EntityTypes.JOB && (
                <div style={{ order: 2 }}>
                    <WorkflowSelector
                        permission={permission}
                        handleDirectPermissionChange={handleDirectPermissionChange}
                        workflowList={workflowList}
                    />
                </div>
            )}
            <div style={{ order: isAccessTypeJob ? 4 : 0 }}>
                {isAccessTypeJob ? (
                    <JobRoleSelector
                        permission={permission}
                        handleUpdateDirectPermissionRoleConfig={handleUpdateDirectPermissionRoleConfig}
                    />
                ) : (
                    <RoleSelector
                        permission={permission}
                        handleUpdateDirectPermissionRoleConfig={handleUpdateDirectPermissionRoleConfig}
                    />
                )}
            </div>
            {showStatus && (
                <div className="h-36 flexbox flex-align-center" style={{ order: 5 }}>
                    <UserStatusUpdate
                        userStatus={permission.status}
                        timeToLive={permission.timeToLive}
                        userEmail=""
                        handleChange={handleStatusChange}
                        disabled={getIsStatusDropdownDisabled(userStatus)}
                        showTooltipWhenDisabled
                        showDropdownBorder={false}
                        breakLinesForTemporaryAccess
                        dropdownClassName="flex-grow-1"
                    />
                </div>
            )}
            <div style={{ order: showStatus ? 6 : 5 }}>
                <Button
                    icon={<TrashIcon />}
                    ariaLabel="Delete"
                    dataTestId={`delete-row-${index}`}
                    onClick={() => removeRow(index)}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                />
            </div>
        </>
    )
}

export default DirectPermission
