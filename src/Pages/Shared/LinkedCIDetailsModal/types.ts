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

import {
    BaseFilterQueryParams,
    UseUrlFiltersReturnType,
    WorkflowType,
    TriggerType,
} from '@devtron-labs/devtron-fe-common-lib'
import { StatusConstants } from '../../../components/app/list-new/Constants'
import { DEPLOYMENT_STATUS } from '../../../config'
import { SortableKeys } from './constants'

export interface LinkedCIDetailModalProps {
    workflows: WorkflowType[]
    handleClose: () => void
}

export interface LinkedCIAppDto {
    appId: number
    appName: string
    deploymentStatus:
        | (typeof DEPLOYMENT_STATUS)[keyof typeof DEPLOYMENT_STATUS]
        | typeof StatusConstants.NOT_DEPLOYED.titleCase
    environmentId: number
    environmentName: string
    triggerMode: (typeof TriggerType)[keyof typeof TriggerType]
}

// Another interface to create segregation from LinkedCIAppDto
export interface LinkedCIApp extends LinkedCIAppDto {}

export type LinkedCIAppListFilterParams = BaseFilterQueryParams<SortableKeys> & {
    environment: string
}

export type CIPpelineEnviromentList = string[]

export interface LinkedCIAppListProps {
    appList: LinkedCIApp[]
    totalCount: number
    isLoading: boolean
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
}

export interface LinkedCIAppUrlProps {
    appId: number
    environmentId: number
}
