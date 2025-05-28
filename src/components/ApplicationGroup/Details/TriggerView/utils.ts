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

import { getIsMaterialApproved } from '@Components/app/details/triggerView/cdMaterials.utils'

import { BulkCDDetailType, BulkCIDetailType } from '../../AppGroup.types'

export const getIsAppUnorthodox = (app: BulkCIDetailType): boolean =>
    app.isLinkedCI || app.isWebhookCI || app.isLinkedCD

export const getIsNonApprovedImageSelected = (appList: BulkCDDetailType[]): boolean =>
    appList.some((app) => {
        if (!app.isExceptionUser) {
            return false
        }

        return (app.material || []).some(
            (material) => material.isSelected && !getIsMaterialApproved(material.userApprovalMetadata),
        )
    })

export const getIsImageApprovedByDeployerSelected = (appList: BulkCDDetailType[]): boolean =>
    appList.some((app) => {
        if (!app.isExceptionUser) {
            return false
        }

        return (app.material || []).some(
            (material) =>
                material.isSelected &&
                !material.canApproverDeploy &&
                material.userApprovalMetadata?.hasCurrentUserApproved,
        )
    })
