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

import { ApprovalRuntimeStateType, CDMaterialType } from '@devtron-labs/devtron-fe-common-lib'

import { RegexValueType } from './types'

export const getWfrId = (selectedMaterial: CDMaterialType, material: CDMaterialType[]) =>
    selectedMaterial ? selectedMaterial.wfrId : material?.find((_mat) => _mat.isSelected)?.wfrId

const isValidRegex = (pattern: string, value: string): boolean => new RegExp(pattern).test(value)

export const getRegexValue = (material): Record<number, RegexValueType> =>
    material.reduce(
        (acc, mat) => {
            acc[mat.gitMaterialId] = {
                value: mat.value,
                isInvalid: mat.regex && !isValidRegex(mat.regex, mat.value),
            }
            return acc
        },
        {} as Record<number, RegexValueType>,
    )

export const getIsMaterialApproved = (userApprovalMetadata: CDMaterialType['userApprovalMetadata']) => {
    if (!userApprovalMetadata) {
        return false
    }

    const { approvalRuntimeState } = userApprovalMetadata
    return approvalRuntimeState === ApprovalRuntimeStateType.approved
}

export const getCanDeployWithoutApproval = (selectedMaterial: CDMaterialType, isExceptionUser: boolean) => {
    const isMaterialApproved = selectedMaterial && getIsMaterialApproved(selectedMaterial.userApprovalMetadata)
    return isExceptionUser && !isMaterialApproved
}

export const getCanImageApproverDeploy = (
    selectedMaterial: CDMaterialType,
    canApproverDeploy: boolean,
    isExceptionUser: boolean,
) => isExceptionUser && !canApproverDeploy && selectedMaterial?.userApprovalMetadata?.hasCurrentUserApproved
