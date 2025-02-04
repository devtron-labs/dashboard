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

export const EnvironmentOverviewTableHeaderFixedKeys = {
    STATUS: 'status',
    NAME: 'name',
} as const

export const EnvironmentOverviewTableHeaderVariableKeys = {
    DEPLOYMENT_STATUS: 'deploymentStatus',
    LAST_DEPLOYED_IMAGE: 'lastDeployedImage',
    COMMITS: 'commits',
    DEPLOYED_AT: 'deployedAt',
    DEPLOYED_BY: 'deployedBy',
} as const

export const EnvironmentOverviewTableHeaderKeys = {
    ...EnvironmentOverviewTableHeaderFixedKeys,
    ...EnvironmentOverviewTableHeaderVariableKeys,
} as const

export const EnvironmentOverviewTableSortableKeys = (({ NAME, DEPLOYED_AT }) => ({ NAME, DEPLOYED_AT }))(
    EnvironmentOverviewTableHeaderKeys,
)

export const EnvironmentOverviewTableHeaderValues: Record<keyof typeof EnvironmentOverviewTableHeaderKeys, string> = {
    NAME: 'APPLICATION',
    DEPLOYMENT_STATUS: 'DEPLOYMENT STATUS',
    LAST_DEPLOYED_IMAGE: 'LAST DEPLOYED IMAGE',
    COMMITS: 'COMMIT',
    DEPLOYED_AT: 'DEPLOYED AT',
    DEPLOYED_BY: 'DEPLOYED BY',
    STATUS: null,
}
