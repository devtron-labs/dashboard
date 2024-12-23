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

/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import { useState, useEffect, useRef } from 'react'
import {
    showError,
    getIsRequestAborted,
    ACCESS_TYPE_MAP,
    EntityTypes,
    SelectPicker,
    ComponentSizeType,
    SelectPickerOptionType,
    Button,
    ButtonVariantType,
    ButtonStyleType,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { getAllWorkflowsForAppNames } from '../../../../../../services/service'
import { HELM_APP_UNASSIGNED_PROJECT, SELECT_ALL_VALUE } from '../../../../../../config'
import { ReactComponent as TrashIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { allApplicationsOption, DirectPermissionFieldName } from './constants'
import { getWorkflowOptions } from '../../../utils'
import { DirectPermissionRowProps } from './types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { DirectPermissionsRoleFilter } from '../../../types'
import { getIsStatusDropdownDisabled } from '../../../libUtils'
import { getDisplayTextByName } from './utils'
import EnvironmentSelector from './EnvironmentSelector'
import WorkflowSelector from './WorkflowSelector'
import RoleSelector from './RoleSelector'

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
    const { showStatus, userStatus } = usePermissionConfiguration()
    const projectId =
        permission.team && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList.find((project) => project.name === permission.team.value)?.id
            : null

    const [applications, setApplications] = useState([])
    const [workflowList, setWorkflowList] = useState({ loading: false, options: [] })

    const abortControllerRef = useRef<AbortController>(new AbortController())

    const isAccessTypeJob = permission.accessType === ACCESS_TYPE_MAP.JOBS

    const listForAccessType = getListForAccessType(permission.accessType)

    const setWorkflowsForJobs = async (_permission: DirectPermissionsRoleFilter) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        setWorkflowList({ loading: true, options: [] })
        try {
            setWorkflowList({ loading: true, options: [] })
            const jobNames =
                _permission.entityName.filter((option) => option.value !== SELECT_ALL_VALUE).map((app) => app.label) ??
                []
            const {
                result: { appIdWorkflowNamesMapping },
            } = await getAllWorkflowsForAppNames(jobNames, abortControllerRef.current.signal)
            const workflowOptions = getWorkflowOptions(appIdWorkflowNamesMapping)
            abortControllerRef.current = null
            setWorkflowList({ loading: false, options: workflowOptions })
        } catch (err) {
            if (!getIsRequestAborted(err)) {
                showError(err)
            }
            setWorkflowList({ loading: false, options: [] })
        }
    }

    useEffect(() => {
        const isJobs = permission.entity === EntityTypes.JOB
        const appOptions = ((projectId && listForAccessType.get(projectId)?.result) || []).map((app) => ({
            label: isJobs ? app.jobName : app.name,
            value: isJobs ? app.appName : app.name,
        }))
        setApplications(appOptions)
        if (permission.entity === EntityTypes.JOB && permission.entityName.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            setWorkflowsForJobs(permission)
        }
    }, [appsList, appsListHelmApps, projectId, jobsList])

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

    const projectOptions: SelectPickerOptionType[] = [
        ...(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
            ? [
                  {
                      name: HELM_APP_UNASSIGNED_PROJECT,
                      description: 'Apps without an assigned project',
                  },
              ]
            : []),
        ...projectsList,
    ].map((project) => ({ label: project.name, value: project.name, description: project.description }))

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
                <SelectPicker
                    inputId="dropdown-for-appOrJob"
                    value={permission.entityName}
                    isMulti
                    isLoading={projectId && listForAccessType.get(projectId)?.loading}
                    isDisabled={!permission.team || (projectId && listForAccessType.get(projectId)?.loading)}
                    name={isAccessTypeJob ? DirectPermissionFieldName.jobs : DirectPermissionFieldName.apps}
                    placeholder={isAccessTypeJob ? 'Select Job' : 'Select applications'}
                    options={[allApplicationsOption(permission.entity), ...applications]}
                    onChange={handleDirectPermissionChange}
                    onBlur={() => {
                        if (permission.entity === EntityTypes.JOB && !jobsList.get(projectId)?.loading) {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            setWorkflowsForJobs(permission)
                        }
                    }}
                    multiSelectProps={{
                        customDisplayText: getDisplayTextByName(
                            isAccessTypeJob ? DirectPermissionFieldName.jobs : DirectPermissionFieldName.apps,
                            [allApplicationsOption(permission.entity), ...applications],
                            permission.entityName,
                        ),
                    }}
                    error={permission.entityNameError}
                    size={ComponentSizeType.large}
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
                <RoleSelector permission={permission} handleDirectPermissionChange={handleDirectPermissionChange} />
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
