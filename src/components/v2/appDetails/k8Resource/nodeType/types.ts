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
import { NodeType } from '@devtron-labs/devtron-fe-common-lib'
import { NodeDetailTabsType } from '../../../../app/types'

export interface PodPopupProps {
    kind: NodeType
    describeNode: (tab?: NodeDetailTabsType) => void
    toggleShowDeleteConfirmation: () => void
    handleShowVulnerabilityModal: () => void
}

export interface NodePodStatus {
    running: number
    all: number
}
