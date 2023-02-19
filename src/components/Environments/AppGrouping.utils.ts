import { DEFAULT_GIT_BRANCH_VALUE, SOURCE_NOT_CONFIGURED } from '../../config'
import { CIMaterialType } from '../app/details/triggerView/MaterialHistory'
import { WorkflowType } from '../app/details/triggerView/types'
import { CDWorkflowStatusType, CIWorkflowStatusType, ProcessWorkFlowStatusType } from './Environments.types'

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
                    node['status'] = ciMap[node.id]?.status
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
) => {
    if (_materialList?.length > 0) {
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
        }
        _materialList.push(ciMaterial)
    }
}
