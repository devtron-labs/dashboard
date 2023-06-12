import { DEFAULT_GIT_BRANCH_VALUE, DOCKER_FILE_ERROR_TITLE, SOURCE_NOT_CONFIGURED } from '../../config'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { CIMaterialType } from '../app/details/triggerView/MaterialHistory'
import { WorkflowType } from '../app/details/triggerView/types'
import { getEnvAppList } from './AppGroup.service'
import { CDWorkflowStatusType, CIWorkflowStatusType, ProcessWorkFlowStatusType } from './AppGroup.types'
import { BlockedStateData } from '@devtron-labs/devtron-fe-common-lib'
import { ConsequenceType } from '@devtron-labs/devtron-fe-common-lib'
import { ConsequenceAction } from '@devtron-labs/devtron-fe-common-lib'

let timeoutId

export const processWorkflowStatuses = (
    allCIs: CIWorkflowStatusType[],
    allCDs: CDWorkflowStatusType[],
    workflowsList: WorkflowType[],
): ProcessWorkFlowStatusType => {
    let ciMap = {}
    let cdMap = {}
    let preCDMap = {}
    let postCDMap = {}
    let cicdInProgress = false
    //Create maps from Array
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
            if (pipeline.pre_status) preCDMap[pipeline.pipeline_id] = pipeline.pre_status
            if (pipeline.post_status) postCDMap[pipeline.pipeline_id] = pipeline.post_status
            if (pipeline.deploy_status) cdMap[pipeline.pipeline_id] = pipeline.deploy_status
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
    //Update Workflow using maps
    const _workflows = workflowsList.map((wf) => {
        wf.nodes = wf.nodes.map((node) => {
            switch (node.type) {
                case 'CI':
                    node['status'] = node.isLinkedCI ? ciMap[node.parentCiPipeline]?.status : ciMap[node.id]?.status
                    node['storageConfigured'] = ciMap[node.id]?.storageConfigured
                    break
                case 'PRECD':
                    node['status'] = preCDMap[node.id]
                    break
                case 'POSTCD':
                    node['status'] = postCDMap[node.id]
                    break
                case 'CD':
                    node['status'] = cdMap[node.id]
                    break
            }
            return node
        })
        return wf
    })
    return { cicdInProgress: cicdInProgress, workflows: _workflows }
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
            isDockerFileError: isDockerFileError,
            dockerFileErrorMsg: isDockerFileError ? DOCKER_FILE_ERROR_TITLE : '',
            isMaterialSelectionError: false,
            materialSelectionErrorMsg: '',
        }
        _materialList.push(ciMaterial)
    }
}

export const envListOptions = (inputValue: string): Promise<[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getEnvAppList({ envName: inputValue })
                .then((response) => {
                    let appList = []
                    if (response.result) {
                        appList = response.result.envList?.map((res) => ({
                            value: res['id'],
                            label: res['environment_name'],
                            appCount: res['appCount'],
                            ...res,
                        }))
                    }
                    resolve(appList as [])
                })
                .catch((errors: ServerErrors) => {
                    resolve([])
                    if (errors.code) {
                        showError(errors)
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
    menuList: (base) => {
        return {
            ...base,
            paddingTop: '0',
            paddingBottom: '0',
            marginBottom: '0',
            borderRadius: '4px',
        }
    },
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0 4px 0 4px',
    }),
}

const getBGColor = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'var(--B100)'
    } else if (isFocused) {
        return 'var(--N50)'
    }
    return 'white'
}

export const getOptionBGClass = (isSelected: boolean, isFocused: boolean): string => {
    if (isSelected) {
        return 'bcb-1'
    } else if (isFocused) {
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
                        branchValues += `${branchValues ? ',' : ''}${mat.source.value}`
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
    } else if (data.isCITriggerBlocked) {
        return { action: ConsequenceAction.BLOCK, metadataField: '0001-01-01T00:00:00Z' }
    } else {
        return data.ciBlockState
    }
}
