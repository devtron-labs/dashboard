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
    ComponentSizeType,
    DeploymentAppTypes,
    ResourceKindType,
    SelectPicker,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { ClusterSelectProps, SelectClusterOptionType } from './types'
import { generateClusterOption } from './utils'

const RESOURCES_TO_FETCH: [ResourceKindType.cluster] = [ResourceKindType.cluster]

const ClusterSelect = ({ clusterId, clusterName, handleClusterChange, deploymentAppType }: ClusterSelectProps) => {
    const { isResourcesOptionsLoading, refetchResourcesOptions, resourcesOptionsError, resourcesOptionsMap } =
        useGetResourceKindsOptions({
            resourcesToFetch: RESOURCES_TO_FETCH,
        })

    const clusterOptions = (resourcesOptionsMap?.[ResourceKindType.cluster] || [])
        .filter((cluster) => !cluster.isVirtual)
        .map<SelectClusterOptionType>((cluster) => generateClusterOption(cluster.name, cluster.id))

    return (
        <div className="w-250">
            <SelectPicker<SelectClusterOptionType['value'], false>
                inputId="migrate-from-source-cluster-select"
                classNamePrefix="migrate-from-source-cluster-select"
                label={
                    deploymentAppType === DeploymentAppTypes.HELM
                        ? 'Cluster containing Helm Release'
                        : 'Cluster containing Argo CD application'
                }
                isLoading={isResourcesOptionsLoading}
                optionListError={resourcesOptionsError}
                reloadOptionList={refetchResourcesOptions}
                options={clusterOptions}
                onChange={handleClusterChange}
                value={clusterId ? generateClusterOption(clusterName, clusterId) : null}
                placeholder="Select a cluster"
                required
                autoFocus
                size={ComponentSizeType.large}
            />
        </div>
    )
}

export default ClusterSelect
