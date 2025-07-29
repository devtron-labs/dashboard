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
    DeleteConfirmationModalProps,
    Never,
    SelectPickerOptionType,
    TagType,
} from '@devtron-labs/devtron-fe-common-lib'

export interface EnvDetails {
    envId: number
    envName: string
    namespace: string
    isProduction: boolean
    description: string
    isVirtualCluster: boolean
    category: SelectPickerOptionType
}

export type EnvDrawerProps = { reload: () => void; hideClusterDrawer: () => void } & (
    | ({ drawerType: 'addEnv'; clusterId?: number; clusterName?: never } & Never<Partial<EnvDetails>>)
    | ({ drawerType: 'editEnv'; clusterId: number; clusterName: string } & EnvDetails)
)

export type EnvironmentFormType = Omit<EnvDetails, 'isVirtualCluster' | 'envId'> & {
    clusterId: number
}

export type GetClusterEnvironmentUpdatePayloadType = Partial<Pick<ClusterNamespacesDTO, 'resourceVersion'>> & {
    data: EnvironmentFormType
    envId: number
    namespaceLabels?: TagType[]
    isVirtualCluster: boolean
}

interface ClusterNamespacesLabel {
    key: string
    value: string
}

export interface ClusterNamespacesDTO {
    name: string
    labels: ClusterNamespacesLabel[]
    resourceVersion: string
}

export interface EnvironmentDeleteComponentProps
    extends Pick<DeleteConfirmationModalProps, 'closeConfirmationModal' | 'onDelete'> {
    environmentName: string
}
