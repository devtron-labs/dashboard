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

import { importComponentFromFELibrary } from '@Components/common'

import { ClusterNamespacesDTO, GetClusterEnvironmentUpdatePayloadType } from './types'

const getCategoryPayload = importComponentFromFELibrary('getCategoryPayload', null, 'function')

export const getClusterEnvironmentUpdatePayload = ({
    data,
    envId,
    namespaceLabels,
    resourceVersion,
    isVirtualCluster,
}: GetClusterEnvironmentUpdatePayloadType) =>
    isVirtualCluster
        ? {
              id: envId,
              environment_name: data.envName,
              namespace: data.namespace || '',
              IsVirtualEnvironment: true,
              cluster_id: data.clusterId,
              description: data.description || '',
              ...(getCategoryPayload ? getCategoryPayload(data.category) : null),
          }
        : {
              id: envId,
              environment_name: data.envName,
              cluster_id: data.clusterId,
              namespace: data.namespace || '',
              active: true,
              default: data.isProduction,
              description: data.description || '',
              updateLabels: !!namespaceLabels,
              ...(getCategoryPayload ? getCategoryPayload(data.category) : null),
              ...(namespaceLabels
                  ? {
                        namespaceResourceVersion: resourceVersion,
                        namespaceLabels: namespaceLabels
                            .filter(({ key, value }) => !!key.trim() && !!value.trim())
                            .map(({ key, value }) => ({ key, value })),
                    }
                  : {}),
          }

export const getClusterNamespaceByName = (namespacesList: ClusterNamespacesDTO[], name: string) =>
    namespacesList.find(({ name: _name }) => _name === name)

export const getNamespaceLabels = (clusterNamespace: ClusterNamespacesDTO) =>
    clusterNamespace?.labels.map(({ key, value }, index) => ({
        id: index,
        key,
        value,
        propagate: true,
        isPropagateDisabled: true,
    })) ?? [
        {
            id: 0,
            key: '',
            value: '',
            propagate: true,
            isPropagateDisabled: true,
        },
    ]
