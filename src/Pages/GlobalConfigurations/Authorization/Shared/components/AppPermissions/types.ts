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

import { GroupBase } from 'react-select'
import { ServerError, ACCESS_TYPE_MAP, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import { JobList } from '../../../../../../components/Jobs/Types'
import { DirectPermissionsRoleFilter } from '../../../types'

type AppsList = Map<number, { loading: boolean; result: { id: number; name: string }[]; error: ServerError }>
type JobsList = Map<number, { loading: boolean; result: JobList['result']['jobContainers']; error: ServerError }>

export interface AppPermissionsDetailType {
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    handleDirectPermissionChange: (...rest) => void
    removeDirectPermissionRow: (index: number) => void
    addNewPermissionRow: (
        accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS,
    ) => void
    appsListHelmApps: AppsList
    jobsList: JobsList
    appsList: AppsList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEnvironmentOptions: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectsList: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    environmentClusterOptions: any
    getListForAccessType: (accessType: ACCESS_TYPE_MAP) => AppsList | JobsList
}

export interface DirectPermissionRowProps
    extends Pick<
        AppPermissionsDetailType,
        | 'appsList'
        | 'jobsList'
        | 'appsListHelmApps'
        | 'projectsList'
        | 'getEnvironmentOptions'
        | 'environmentClusterOptions'
        | 'getListForAccessType'
    > {
    permission: DirectPermissionsRoleFilter
    handleDirectPermissionChange: (...rest) => void
    index: number
    removeRow: (index: number) => void
}

export interface WorkflowListType {
    options: GroupBase<SelectPickerOptionType>[]
    loading: boolean
}
