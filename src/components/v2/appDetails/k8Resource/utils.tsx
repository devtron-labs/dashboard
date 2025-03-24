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

import { AppType, Node, NodeFilters } from '@devtron-labs/devtron-fe-common-lib'
import { ApplicationsGAEvents } from '../constants'

export const doesNodeSatisfiesFilter = (node: Node, filter: string) =>
    node.health?.status.toLowerCase() === filter || (filter === NodeFilters.drifted && node.hasDrift)

export const getApplicationsGAEvent = (appType: AppType) => {
    switch (appType) {
        case AppType.DEVTRON_HELM_CHART:
            return ApplicationsGAEvents.REFRESH_HELM_APP_RESOURCE_TREE
        case AppType.EXTERNAL_ARGO_APP:
            return ApplicationsGAEvents.REFRESH_ARGO_APP_RESOURCE_TREE
        case AppType.EXTERNAL_FLUX_APP:
            return ApplicationsGAEvents.REFRESH_FLUX_APP_RESOURCE_TREE
        default:
            return ApplicationsGAEvents.REFRESH_DEVTRON_APP_RESOURCE_TREE
    }
}
