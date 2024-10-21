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

// ====== Service Types: Start ====== //

import { ResourceKindType } from '@Shared/types'
import { ServerErrors } from '@Common/ServerError'
import { getAppOptionsGroupedByProjects, getClusterOptions, getEnvironmentOptions, getProjectOptions } from './service'

export interface AppType {
    name: string
}

export type AppsGroupedByProjectsType = {
    projectId: number
    projectName: string
    appList: AppType[]
}[]

export interface ClusterDTO {
    id: number
    cluster_name: string
    isVirtualCluster: boolean
}

// ====== Service Types: End ====== //

export interface UseGetResourceKindsOptionsProps {
    resourcesToFetch: Extract<
        ResourceKindType,
        | ResourceKindType.devtronApplication
        | ResourceKindType.project
        | ResourceKindType.cluster
        | ResourceKindType.environment
    >[]
}

export interface UseGetResourceKindOptionsReturnType {
    isResourcesOptionsLoading: boolean
    resourcesOptionsMap: {
        [ResourceKindType.devtronApplication]: Awaited<ReturnType<typeof getAppOptionsGroupedByProjects>>
        [ResourceKindType.project]: Awaited<ReturnType<typeof getProjectOptions>>
        [ResourceKindType.cluster]: Awaited<ReturnType<typeof getClusterOptions>>
        [ResourceKindType.environment]: Awaited<ReturnType<typeof getEnvironmentOptions>>
    }
    resourcesOptionsError: ServerErrors
    refetchResourcesOptions: () => void
}
