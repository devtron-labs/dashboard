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

import { ApprovalRuntimeStateType, CDMaterialType, FilterStates } from '@devtron-labs/devtron-fe-common-lib'

import { LAST_SAVED_CONFIG_OPTION, SPECIFIC_TRIGGER_CONFIG_OPTION } from './TriggerView.utils'
import { CDMaterialState, FilterConditionViews, MATERIAL_TYPE, RegexValueType } from './types'

export const getInitialState = (materialType: string, material: CDMaterialType[], searchImageTag: string) => () => ({
    isSecurityModuleInstalled: false,
    loadingMore: false,
    showOlderImages: true,
    selectedConfigToDeploy:
        materialType === MATERIAL_TYPE.rollbackMaterialList ? SPECIFIC_TRIGGER_CONFIG_OPTION : LAST_SAVED_CONFIG_OPTION,
    selectedMaterial: material.find((_mat) => _mat.isSelected),
    isRollbackTrigger: materialType === MATERIAL_TYPE.rollbackMaterialList,
    isSelectImageTrigger: materialType === MATERIAL_TYPE.inputMaterialList,
    materialInEditModeMap: new Map<number, boolean>(),
    showSearch: !!searchImageTag,
    areMaterialsPassingFilters:
        material.filter((materialDetails) => materialDetails.filterState === FilterStates.ALLOWED).length > 0,
    searchApplied: !!searchImageTag,
    searchText: searchImageTag ?? '',
    showConfiguredFilters: false,
    filterView: FilterConditionViews.ELIGIBLE,
    resourceFilters: [],
})

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

export const getCanDeployWithoutApproval = (state: CDMaterialState, isExceptionUser: boolean) => {
    const isMaterialApproved =
        state.selectedMaterial && getIsMaterialApproved(state.selectedMaterial.userApprovalMetadata)

    return isExceptionUser && !isMaterialApproved
}

export const getCanImageApproverDeploy = (
    state: CDMaterialState,
    canApproverDeploy: boolean,
    isExceptionUser: boolean,
) => isExceptionUser && !canApproverDeploy && state.selectedMaterial?.userApprovalMetadata?.hasCurrentUserApproved
