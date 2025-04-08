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

import { getIsApprovalPolicyConfigured } from '@devtron-labs/devtron-fe-common-lib'
import { getIsMaterialApproved } from '@Components/app/details/triggerView/cdMaterials.utils'
import { BulkCDDetailType, BulkCIDetailType } from '../../AppGroup.types'

export const getIsAppUnorthodox = (app: BulkCIDetailType): boolean =>
    app.isLinkedCI || app.isWebhookCI || app.isLinkedCD

export const getIsNonApprovedImageSelected = (appList: BulkCDDetailType[]): boolean => {
    const isNonApprovedImageSelected = appList.some((app) => {
        if (!app.isExceptionUser || !getIsApprovalPolicyConfigured(app.approvalConfigData)) {
            return false
        }

        return app.material?.some((material) => {
            const { approvalConfigData } = material.userApprovalMetadata
            return (
                (material.isSelected && !approvalConfigData.requiredCount) || !getIsMaterialApproved(approvalConfigData)
            )
        })
    })

    return isNonApprovedImageSelected
}
