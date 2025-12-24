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

import { DeploymentNodeType, DeploymentStageType, History, STAGE_TYPE } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../common'

export const renderCIListHeader = importComponentFromFELibrary('renderCIListHeader', null, 'function')

export const renderDeploymentApprovalInfo = importComponentFromFELibrary(
    'renderDeploymentApprovalInfo',
    null,
    'function',
)

export const renderDeploymentHistoryTriggerMetaText = importComponentFromFELibrary(
    'renderDeploymentHistoryTriggerMetaText',
    null,
    'function',
)

export const renderVirtualHistoryArtifacts = importComponentFromFELibrary(
    'renderVirtualHistoryArtifacts',
    null,
    'function',
)

export const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary(
    'processVirtualEnvironmentDeploymentData',
    null,
    'function',
)

export const renderRunSource = importComponentFromFELibrary('renderRunSource', null, 'function')

export const renderRunSourceInDropdown = importComponentFromFELibrary('renderRunSourceInDropdown', null, 'function')

export const getUpdatedTriggerId = (initialTriggerId: number, queryParam: string, cdWorkflows: History[]): number => {
    if (queryParam === STAGE_TYPE.PRECD || queryParam === STAGE_TYPE.POSTCD || queryParam === DeploymentNodeType.CD) {
        const deploymentStageTypeForPrePostCD =
            queryParam === STAGE_TYPE.PRECD ? DeploymentStageType.PRE : DeploymentStageType.POST
        const deploymentStageType =
            queryParam === DeploymentNodeType.CD ? DeploymentStageType.DEPLOY : deploymentStageTypeForPrePostCD

        const requiredResult = cdWorkflows?.filter((obj) => obj.stage === deploymentStageType)
        if (requiredResult?.[0]) {
            return requiredResult[0].id
        }
    }

    return initialTriggerId
}
