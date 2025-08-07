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

import { MutableRefObject } from 'react'

import { ClusterDetail } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterViewType {
    clusterOptions: ClusterDetail[]
    clusterListLoader: boolean
    initialLoading: boolean
    refreshData: () => void
    parentRef: MutableRefObject<HTMLDivElement>
}

export interface ClusterListTypes {
    filteredList: ClusterDetail[]
    clusterListLoader: boolean
    showKubeConfigModal: boolean
    onChangeShowKubeConfigModal: () => void
    setSelectedClusterName: React.Dispatch<React.SetStateAction<string>>
}
export interface ClusterListRowTypes extends Omit<ClusterListTypes, 'filteredList'> {
    clusterData: ClusterDetail
}

export interface ClusterSelectionBodyTypes extends ClusterViewType {
    filteredList: ClusterDetail[]
}
