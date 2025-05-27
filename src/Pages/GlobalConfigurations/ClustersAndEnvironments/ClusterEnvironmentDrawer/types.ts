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
    ClusterEnvironmentCategoryType,
    DeleteConfirmationModalProps,
    SelectPickerOptionType,
    TagType,
} from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterEnvironmentDrawerFormProps {
    environmentName: string
    namespace: string
    isProduction: boolean
    description: string
    category: ClusterEnvironmentCategoryType
}

export interface ClusterEnvironmentDrawerProps extends ClusterEnvironmentDrawerFormProps {
    id: string
    clusterId: number
    reload: () => void
    hideClusterDrawer: () => void
    isVirtual: boolean
    clusterName: string
}

export type GetClusterEnvironmentUpdatePayloadType = Pick<
    ClusterEnvironmentDrawerProps,
    'clusterId' | 'id' | 'isVirtual'
> &
    Partial<Pick<ClusterNamespacesDTO, 'resourceVersion'>> & {
        data: ClusterEnvironmentDrawerFormProps
        namespaceLabels?: TagType[]
        selectedCategory?: SelectPickerOptionType
    }

export interface ClusterNamespacesLabel {
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
