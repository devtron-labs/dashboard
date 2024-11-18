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
    ServerErrors,
    showError,
    BlockedStateData,
    ConsequenceType,
    ConsequenceAction,
    WorkflowType,
    getIsRequestAborted,
    CIMaterialType,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_GIT_BRANCH_VALUE, DOCKER_FILE_ERROR_TITLE, SOURCE_NOT_CONFIGURED } from '../../config'
import { getEnvAppList } from './AppGroup.service'
import {
    AppGroupUrlFilters,
    CDWorkflowStatusType,
    CIWorkflowStatusType,
    ProcessWorkFlowStatusType,
    FilterParentType,
    SetFiltersInLocalStorageParamsType,
    AppEnvLocalStorageKeyType,
} from './AppGroup.types'
import { getParsedBranchValuesForPlugin } from '@Components/common'
import { APP_GROUP_LOCAL_STORAGE_KEY, ENV_GROUP_LOCAL_STORAGE_KEY } from './Constants'

let timeoutId

export const processWorkflowStatuses = (
    allCIs: CIWorkflowStatusType[],
    allCDs: CDWorkflowStatusType[],
    workflowsList: WorkflowType[],
): ProcessWorkFlowStatusType => {
    const ciMap = {}
    const cdMap = {}
    const preCDMap = {}
    const postCDMap = {}
    let cicdInProgress = false
    // Create maps from Array
    if (allCIs.length) {
        allCIs.forEach((pipeline) => {
            ciMap[pipeline.ciPipelineId] = {
                status: pipeline.ciStatus,
                storageConfigured: pipeline.storageConfigured || false,
            }
            if (!cicdInProgress && (pipeline.ciStatus === 'Starting' || pipeline.ciStatus === 'Running')) {
                cicdInProgress = true
            }
        })
    }
    if (allCDs.length) {
        allCDs.forEach((pipeline) => {
            if (pipeline.pre_status) {
                preCDMap[pipeline.pipeline_id] = pipeline.pre_status
            }
            if (pipeline.post_status) {
                postCDMap[pipeline.pipeline_id] = pipeline.post_status
            }
            if (pipeline.deploy_status) {
                cdMap[pipeline.pipeline_id] = pipeline.deploy_status
            }
            if (
                !cicdInProgress &&
                (pipeline.pre_status === 'Starting' ||
                    pipeline.pre_status === 'Running' ||
                    pipeline.deploy_status === 'Progressing' ||
                    pipeline.post_status === 'Starting' ||
                    pipeline.post_status === 'Running')
            ) {
                cicdInProgress = true
            }
        })
    }
    // Update Workflow using maps
    const _workflows = workflowsList.map((wf) => {
        wf.nodes = wf.nodes.map((node) => {
            switch (node.type) {
                case 'CI':
                    node.status = node.isLinkedCI ? ciMap[node.parentCiPipeline]?.status : ciMap[node.id]?.status
                    node.storageConfigured = ciMap[node.id]?.storageConfigured
                    break
                case 'PRECD':
                    node.status = preCDMap[node.id]
                    break
                case 'POSTCD':
                    node.status = postCDMap[node.id]
                    break
                case 'CD':
                    node.status = cdMap[node.id]
                    break
            }
            return node
        })
        return wf
    })
    return { cicdInProgress, workflows: _workflows }
}

export const handleSourceNotConfigured = (
    configuredMaterialList: Map<number, Set<number>>,
    wf: WorkflowType,
    _materialList: any[],
    isDockerFileError: boolean,
) => {
    if (_materialList.length > 0) {
        _materialList.forEach((node) => configuredMaterialList[wf.name].add(node.gitMaterialId))
    }

    for (const material of wf.gitMaterials) {
        if (configuredMaterialList[wf.name].has(material.gitMaterialId)) {
            continue
        }
        const ciMaterial: CIMaterialType = {
            id: 0,
            gitMaterialId: material.gitMaterialId,
            gitMaterialName: material.materialName.toLowerCase(),
            type: '',
            value: DEFAULT_GIT_BRANCH_VALUE,
            active: false,
            gitURL: '',
            isRepoError: false,
            repoErrorMsg: '',
            isBranchError: true,
            branchErrorMsg: SOURCE_NOT_CONFIGURED,
            regex: '',
            history: [],
            isSelected: _materialList.length === 0,
            lastFetchTime: '',
            isRegex: false,
            isDockerFileError,
            dockerFileErrorMsg: isDockerFileError ? DOCKER_FILE_ERROR_TITLE : '',
            isMaterialSelectionError: false,
            materialSelectionErrorMsg: '',
        }
        _materialList.push(ciMaterial)
    }
}

export const envListOptions = (inputValue: string, signal?: AbortSignal): Promise<[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getEnvAppList({ searchKey: inputValue }, signal)
                .then((response) => {
                    let appList = []
                    if (response.result) {
                        appList = response.result.envList?.map((res) => ({
                            value: res.id,
                            label: res.environment_name,
                            appCount: res.appCount,
                            ...res,
                        }))
                    }
                    resolve(appList as [])
                })
                .catch((errors: ServerErrors) => {
                    if (!getIsRequestAborted(errors)) {
                        resolve([])
                        if (errors.code) {
                            showError(errors)
                        }
                    }
                })
        }, 300)
    })

export const appGroupAppSelectorStyle = {
    control: (base, state) => ({
        ...base,
        border: state.menuIsOpen ? '1px solid var(--B500)' : 'unset',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: '4px',
        height: '32px',
        fontSize: '12px',
        width: state.menuIsOpen ? '250px' : 'unset',
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => ({
        ...base,
        fontWeight: '500',
        fontSize: '13px',
        padding: '6px 8px 6px 0',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        backgroundColor: getBGColor(state.isSelected, state.isFocused),
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        padding: '0 0 0 10px',
        display: 'flex',
        height: '30px',
        fontSize: '13px',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        pointerEvents: 'all',
        width: state.menuIsOpen ? '250px' : 'max-content',
        whiteSpace: 'nowrap',
    }),
    menuList: (base) => ({
        ...base,
        paddingTop: '0',
        paddingBottom: '0',
        marginBottom: '0',
        borderRadius: '4px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0 4px 0 4px',
    }),
}

const getBGColor = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'var(--B100)'
    }
    if (isFocused) {
        return 'var(--N50)'
    }
    return 'white'
}

export const getOptionBGClass = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'bcb-1'
    }
    if (isFocused) {
        return 'bc-n50'
    }
    return 'bcn-0'
}

export const getBranchValues = (ciNodeId: string, workflows: WorkflowType[], filteredCIPipelines) => {
    let branchValues = ''

    for (const workflow of workflows) {
        for (const node of workflow.nodes) {
            if (node.type === 'CI' && node.id == ciNodeId) {
                const selectedCIPipeline = filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
                if (selectedCIPipeline?.ciMaterial) {
                    for (const mat of selectedCIPipeline.ciMaterial) {
                        branchValues += `${branchValues ? ',' : ''}${getParsedBranchValuesForPlugin(mat.source.value)}`
                    }
                }
                break
            }
        }
    }
    return branchValues
}

export const processConsequenceData = (data: BlockedStateData): ConsequenceType | null => {
    if (!data.isOffendingMandatoryPlugin) {
        return null
    }
    if (data.isCITriggerBlocked) {
        return { action: ConsequenceAction.BLOCK }
    }
    return data.ciBlockState
}

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [AppGroupUrlFilters.cluster]: searchParams.getAll(AppGroupUrlFilters.cluster),
})

export const getAppFilterLocalStorageKey = (filterParentType: FilterParentType): AppEnvLocalStorageKeyType => 
        filterParentType === FilterParentType.app ? ENV_GROUP_LOCAL_STORAGE_KEY : APP_GROUP_LOCAL_STORAGE_KEY

export const setFilterInLocalStorage = ({
    filterParentType,
    resourceId,
    resourceList,
    groupList,
}: SetFiltersInLocalStorageParamsType) => {
    const localStorageKey = getAppFilterLocalStorageKey(filterParentType)
    try {
        const localStorageValue = localStorage.getItem(localStorageKey)
        const localStoredMap = new Map(localStorageValue ? JSON.parse(localStorageValue) : null)
        localStoredMap.set(resourceId, [resourceList, groupList])
        // Set filter in local storage as Array from Map of resourceId vs [selectedAppList, selectedGroupFilter]
        localStorage.setItem(localStorageKey, JSON.stringify(Array.from(localStoredMap)))
    } catch {
        localStorage.setItem(localStorageKey, '')
    }
}
