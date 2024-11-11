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

import { useMemo } from 'react'
import { ResourceKindType } from '@Shared/types'
import { useAsync } from '@Common/Helper'
import {
    getAppOptionsGroupedByProjects,
    getClusterOptions,
    getEnvironmentOptionsGroupedByClusters,
    getProjectOptions,
} from './service'
import { UseGetResourceKindOptionsReturnType, UseGetResourceKindsOptionsProps } from './types'
import { getResourcesToFetchMap } from './utils'

/**
 * Generic hook to fetch the options list for the supported resource kinds.
 *
 * Note: no call would be made for empty resource kind list
 *
 * @example Usage
 * ```tsx
 * const data = useGetResourceKindsOptions({
 *      resourcesToFetch: [ResourceKindType.devtronApplication, ResourceKindType.environment]
 * })
 * ```
 */
const useGetResourceKindsOptions = ({
    resourcesToFetch,
}: UseGetResourceKindsOptionsProps): UseGetResourceKindOptionsReturnType => {
    const resourcesToFetchMap = useMemo(() => getResourcesToFetchMap(resourcesToFetch), [resourcesToFetch])
    const [isResourcesOptionsLoading, resourcesOptions, resourcesOptionsError, refetchResourcesOptions] = useAsync(
        () =>
            Promise.all([
                resourcesToFetchMap[ResourceKindType.devtronApplication] ? getAppOptionsGroupedByProjects() : null,
                resourcesToFetchMap[ResourceKindType.project] ? getProjectOptions() : null,
                resourcesToFetchMap[ResourceKindType.cluster] ? getClusterOptions() : null,
                resourcesToFetchMap[ResourceKindType.environment] ? getEnvironmentOptionsGroupedByClusters() : null,
            ]),
        [resourcesToFetchMap],
        resourcesToFetch.length > 0,
    )

    return {
        isResourcesOptionsLoading,
        resourcesOptionsMap: {
            [ResourceKindType.devtronApplication]: resourcesOptions?.[0] ?? [],
            [ResourceKindType.project]: resourcesOptions?.[1] ?? [],
            [ResourceKindType.cluster]: resourcesOptions?.[2] ?? [],
            [ResourceKindType.environment]: resourcesOptions?.[3] ?? [],
        },
        resourcesOptionsError,
        refetchResourcesOptions,
    }
}

export default useGetResourceKindsOptions
