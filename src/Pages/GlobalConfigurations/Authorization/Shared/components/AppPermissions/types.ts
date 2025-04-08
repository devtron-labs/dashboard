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

import { Dispatch, SetStateAction } from 'react'
import { GroupBase, GroupHeadingProps, GroupProps, OptionProps } from 'react-select'

import {
    ACCESS_TYPE_MAP,
    CustomRoles,
    EnvListMinDTO,
    RoleSelectorOptionType,
    SelectPickerOptionType,
    ServerError,
    Teams,
    UserRoleConfig,
} from '@devtron-labs/devtron-fe-common-lib'

import { JobList } from '../../../../../../components/Jobs/Types'
import { DirectPermissionsRoleFilter } from '../../../types'

type AppsList = Map<number, { loading: boolean; result: { id: number; name: string }[]; error: ServerError }>
type JobsList = Map<number, { loading: boolean; result: JobList['result']['jobContainers']; error: ServerError }>
export type ProjectsListType = Record<ACCESS_TYPE_MAP, Teams[]>
export type EnvironmentsListType = Record<ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.JOBS, EnvListMinDTO[]>

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
    projectsList: ProjectsListType
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

export interface WorkflowSelectorProps
    extends Pick<DirectPermissionRowProps, 'permission' | 'handleDirectPermissionChange'> {
    workflowList: WorkflowListType
}

export interface AppOrJobSelectorProps
    extends Pick<
        DirectPermissionRowProps,
        | 'permission'
        | 'getListForAccessType'
        | 'handleDirectPermissionChange'
        | 'projectsList'
        | 'appsList'
        | 'jobsList'
        | 'appsListHelmApps'
    > {
    setWorkflowList: Dispatch<SetStateAction<WorkflowListType>>
}

export interface RoleSelectorToggleConfig {
    baseRole: boolean
    accessManagerRoles: boolean
}

export interface RoleSelectorProps {
    permission: DirectPermissionsRoleFilter
    handleUpdateDirectPermissionRoleConfig: (updatedRoleConfig: UserRoleConfig) => void
}

export interface RoleSelectorGroupParams {
    props: GroupProps
    baseRoleValue: string
    toggleConfig: RoleSelectorToggleConfig
}

export interface RoleSelectorGroupHeadingParams extends Pick<RoleSelectorGroupParams, 'toggleConfig'> {
    props: GroupHeadingProps
    showToggle: boolean
    toggleBaseRole: () => void
    toggleAccessManagerRoles: () => void
}

export interface RoleSelectorOptionParams extends Pick<RoleSelectorProps, 'handleUpdateDirectPermissionRoleConfig'> {
    props: OptionProps<RoleSelectorOptionType>
    roleConfig: UserRoleConfig
}

export interface RoleSelectorGroupHeaderProps extends Pick<RoleSelectorGroupHeadingParams, 'showToggle'> {
    label: string
    toggleSelected: boolean
    onChange: () => void
}

export interface GetRoleConfigParams {
    customRoles: CustomRoles[]
    accessType: ACCESS_TYPE_MAP
    showAccessRoles: boolean
    showDeploymentApproverRole: boolean
}
