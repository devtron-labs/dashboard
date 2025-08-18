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
    SourceTypeMap,
    DEPLOYMENT_STATUS,
    WorkflowStatusEnum,
    RecentlyVisitedGroupedOptionsType,
    RecentlyVisitedOptions,
    BaseRecentlyVisitedEntitiesTypes
} from '@devtron-labs/devtron-fe-common-lib'
import { getParsedBranchValuesForPlugin } from '@Components/common'
import { DEFAULT_GIT_BRANCH_VALUE, DOCKER_FILE_ERROR_TITLE, SOURCE_NOT_CONFIGURED, URLS } from '../../config'
import { getEnvAppList } from './AppGroup.service'
import {
    AppGroupUrlFilters,
    CDWorkflowStatusType,
    CIWorkflowStatusType,
    ProcessWorkFlowStatusType,
    AppGroupListType,
} from './AppGroup.types'
import { getMinCharSearchPlaceholderGroup } from '@Components/AppSelector/constants'

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
            if (
                !cicdInProgress &&
                (pipeline.ciStatus === WorkflowStatusEnum.STARTING ||
                    pipeline.ciStatus === WorkflowStatusEnum.RUNNING ||
                    pipeline.ciStatus === WorkflowStatusEnum.WAITING_TO_START)
            ) {
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
                (pipeline.pre_status === WorkflowStatusEnum.STARTING ||
                    pipeline.pre_status === WorkflowStatusEnum.RUNNING ||
                    pipeline.pre_status === WorkflowStatusEnum.WAITING_TO_START ||
                    pipeline.deploy_status === WorkflowStatusEnum.PROGRESSING ||
                    pipeline.post_status === WorkflowStatusEnum.STARTING ||
                    pipeline.post_status === WorkflowStatusEnum.RUNNING ||
                    pipeline.post_status === WorkflowStatusEnum.WAITING_TO_START)
            ) {
                cicdInProgress = true
            }
        })
    }
    // Update Workflow using maps, returning new objects for reactivity
    const _workflows = workflowsList.map((wf) => ({
        ...wf,
        nodes: wf.nodes.map((node) => {
            switch (node.type) {
                case 'CI':
                    return {
                        ...node,
                        status: ciMap[node.id]?.status,
                        storageConfigured: ciMap[node.id]?.storageConfigured,
                    }
                case 'PRECD':
                    return {
                        ...node,
                        status: preCDMap[node.id],
                    }
                case 'POSTCD':
                    return {
                        ...node,
                        status: postCDMap[node.id],
                    }
                case 'CD':
                    return {
                        ...node,
                        status: cdMap[node.id],
                    }
                default:
                    return { ...node }
            }
        })
    }))
    return { cicdInProgress, workflows: _workflows }
}

export const handleSourceNotConfigured = (
    configuredMaterialList: Map<number, Set<number>>,
    wf: WorkflowType,
    _materialList: any[] = [],
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

export const envListOptions = (
    inputValue: string,
    signal: AbortSignal,
    recentlyVisitedResources: BaseRecentlyVisitedEntitiesTypes[],
): Promise<RecentlyVisitedGroupedOptionsType[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve(
                    recentlyVisitedResources?.length
                        ? [
                              {
                                  label: 'Recently Visited',
                                  options: recentlyVisitedResources.map((env: BaseRecentlyVisitedEntitiesTypes) => ({
                                      label: env.name,
                                      value: env.id,
                                      isRecentlyVisited: true,
                                  })) as RecentlyVisitedOptions[],
                              },
                              getMinCharSearchPlaceholderGroup('Environments'),
                          ]
                        : [],
                )
            } else {
                getEnvAppList({ searchKey: inputValue }, signal)
                    .then((response) => {
                        const appList = response.result
                            ? ([
                                  {
                                      label: 'All Environments',
                                      options: response.result.envList.map((res) => ({
                                          value: res.id,
                                          label: res.environment_name,
                                      })) as RecentlyVisitedOptions[],
                                  },
                              ] as RecentlyVisitedGroupedOptionsType[])
                            : []

                        resolve(appList)
                    })
                    .catch((errors: ServerErrors) => {
                        if (!getIsRequestAborted(errors)) {
                            resolve([])
                            if (errors.code) {
                                showError(errors)
                            }
                        }
                    })
            }
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
        backgroundColor: 'var(--bg-primary)',
    }),
    singleValue: (base, state) => ({
        ...base,
        color: 'var(--N900)',
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
    menu: (base) => ({
        ...base,
        border: '1px solid var(--N200)',
        backgroundColor: 'var(--bg-primary)',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
}

const getBGColor = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'var(--B100)'
    }
    if (isFocused) {
        return 'var(--bg-secondary)'
    }
    return 'var(--bg-primary)'
}

export const getOptionBGClass = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'bcb-1'
    }
    if (isFocused) {
        return 'bg__secondary'
    }
    return 'bg__primary'
}

export const getBranchValues = (ciNodeId: string, workflows: WorkflowType[], filteredCIPipelines) => {
    let branchValues = ''

    for (const workflow of workflows) {
        for (const node of workflow.nodes) {
            if (node.type === 'CI' && node.id == ciNodeId) {
                const selectedCIPipeline = filteredCIPipelines.find((_ci) => _ci.id === +ciNodeId)
                if (selectedCIPipeline?.ciMaterial) {
                    for (const mat of selectedCIPipeline.ciMaterial) {
                        if (mat.source.type !== SourceTypeMap.WEBHOOK) {
                            const parsedValue = getParsedBranchValuesForPlugin(mat.source.value)

                            branchValues += `${branchValues && parsedValue ? ',' : ''}${parsedValue}`
                        }
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

export const getAppGroupDeploymentHistoryLink = (
    appId: number,
    envId: string,
    pipelineId: string,
    redirectToAppGroup: boolean = true,
    status: string = '',
    type?: string | null,
) => {
    if (status?.toLowerCase() === DEPLOYMENT_STATUS.PROGRESSING) {
        //If deployment is in progress then it will redirect to app details page
        return `${URLS.APPLICATION_GROUP}/${envId}/${URLS.APP_DETAILS}/${appId}`
    }
    if (redirectToAppGroup) {
        // It will redirect to application group deployment history in case of same environment
        return `${URLS.APPLICATION_GROUP}/${envId}/${URLS.APP_CD_DETAILS}/${appId}/${pipelineId}${type ? `?type=${type}` : ''}`
        // It will redirect to application deployment history in case of other environments
    }
    return `${URLS.APP}/${appId}/${URLS.APP_CD_DETAILS}/${envId}/${pipelineId}${type ? `?type=${type}` : ''}`
}

export const parseAppListData = (
    data: AppGroupListType,
    statusRecord: Record<string, { status: string; pipelineId: number }>,
) => {
    const parsedData = {
        environment: data.environmentName,
        namespace: data.namespace || '-',
        cluster: data.clusterName,
        appInfoList: [],
    }

    data?.apps?.forEach((app) => {
        const appInfo = {
            appId: app.appId,
            application: app.appName,
            appStatus: app.appStatus,
            deploymentStatus: statusRecord[app.appId].status,
            pipelineId: statusRecord[app.appId].pipelineId,
            lastDeployed: app.lastDeployedTime,
            lastDeployedBy: app.lastDeployedBy,
            lastDeployedImage: app.lastDeployedImage,
            commits: app.commits,
            ciArtifactId: app.ciArtifactId,
        }
        parsedData.appInfoList.push(appInfo)
    })

    return parsedData
}

export const getDeploymentHistoryLink = (appId: number, pipelineId: number, envId: string) =>
    `${URLS.APPLICATION_GROUP}/${envId}/cd-details/${appId}/${pipelineId}/`

export const getAppRedirectLink = (appId: number, envId: number) =>
    `${URLS.APPLICATION_GROUP}/${envId}${URLS.DETAILS}/${appId}`
