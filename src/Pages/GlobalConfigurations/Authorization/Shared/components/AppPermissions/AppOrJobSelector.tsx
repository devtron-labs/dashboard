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

import { useEffect, useRef, useState } from 'react'

import {
    ACCESS_TYPE_MAP,
    ComponentSizeType,
    EntityTypes,
    getIsRequestAborted,
    SelectPicker,
    SelectPickerOptionType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { getUserAccessAllWorkflows } from '@Pages/GlobalConfigurations/Authorization/authorization.service'

import { HELM_APP_UNASSIGNED_PROJECT, SELECT_ALL_VALUE } from '../../../../../../config'
import { DirectPermissionsRoleFilter } from '../../../types'
import { getWorkflowOptions } from '../../../utils'
import { allApplicationsOption, DirectPermissionFieldName } from './constants'
import { AppOrJobSelectorProps } from './types'
import { getDisplayTextByName } from './utils'

const AppOrJobSelector = ({
    permission,
    handleDirectPermissionChange,
    getListForAccessType,
    projectsList,
    appsList,
    jobsList,
    appsListHelmApps,
    setWorkflowList,
}: AppOrJobSelectorProps) => {
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const [applications, setApplications] = useState<SelectPickerOptionType[]>([])

    const isAccessTypeJob = permission.accessType === ACCESS_TYPE_MAP.JOBS
    const projectId =
        permission.team && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList[permission.accessType].find((project) => project.name === permission.team.value)?.id
            : null
    const listForAccessType = getListForAccessType(permission.accessType)
    const appOrJobSelectorName = isAccessTypeJob ? DirectPermissionFieldName.jobs : DirectPermissionFieldName.apps
    const appOrJobSelectorOptions = [allApplicationsOption(permission), ...applications]

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
            const { appIdWorkflowNamesMapping } = await getUserAccessAllWorkflows({
                appIds: jobNames,
                options: { abortControllerRef },
            })
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

    return (
        <SelectPicker
            inputId="dropdown-for-appOrJob"
            value={permission.entityName}
            isMulti
            isLoading={projectId && listForAccessType.get(projectId)?.loading}
            isDisabled={!permission.team || (projectId && listForAccessType.get(projectId)?.loading)}
            name={appOrJobSelectorName}
            placeholder={isAccessTypeJob ? 'Select Job' : 'Select applications'}
            options={appOrJobSelectorOptions}
            onChange={handleDirectPermissionChange}
            onBlur={() => {
                if (permission.entity === EntityTypes.JOB && !jobsList.get(projectId)?.loading) {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    setWorkflowsForJobs(permission)
                }
            }}
            multiSelectProps={{
                customDisplayText: getDisplayTextByName(
                    appOrJobSelectorName,
                    appOrJobSelectorOptions,
                    permission.entityName,
                ),
            }}
            error={permission.entityNameError}
            size={ComponentSizeType.large}
            disableDescriptionEllipsis
        />
    )
}

export default AppOrJobSelector
