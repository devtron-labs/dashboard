import {
    APIOptions,
    CIMaterialType,
    CommonNodeAttr,
    PromiseAllStatusType,
    SourceTypeMap,
    WorkflowNodeType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BulkCIDetailType, ResponseRowType } from '@Components/ApplicationGroup/AppGroup.types'
import {
    BulkResponseStatus,
    SKIPPED_RESOURCES_MESSAGE,
    SKIPPED_RESOURCES_STATUS_TEXT,
} from '@Components/ApplicationGroup/Constants'
import { CIPipelineBuildType } from '@Components/ciPipeline/types'
import { importComponentFromFELibrary } from '@Components/common'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR } from '@Config/constantMessaging'
import { DEFAULT_GIT_BRANCH_VALUE } from '@Config/constants'

import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from '../Constants'
import { BuildImageModalProps, CIPipelineMaterialDTO } from '../types'
import { getCIMaterials, triggerBuild } from './service'
import {
    GetBulkCIDataPromiseGetterListProps,
    GetTriggerBuildPayloadProps,
    ParseBulkCIResponseIntoBulkCIDetailProps,
    TriggerBuildPayloadType,
} from './types'

const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')
const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')

export const getIsRegexBranchNotAvailable = (
    selectedCIPipeline: BuildImageModalProps['filteredCIPipelines'][number],
    materialList: CIMaterialType[],
) =>
    !!selectedCIPipeline?.ciMaterial?.some(
        (material) =>
            material.isRegex &&
            materialList.some((_mat) => _mat.gitMaterialId === material.gitMaterialId && !_mat.value),
    )

export const getTriggerBuildPayload = ({
    materialList,
    ciConfiguredGitMaterialId,
    runtimeParams,
    selectedEnv,
    invalidateCache,
    isJobCI,
    ciNodeId,
}: GetTriggerBuildPayloadProps): TriggerBuildPayloadType | string => {
    const gitMaterials = new Map<number, string[]>()
    const ciPipelineMaterials: CIPipelineMaterialDTO[] = []

    materialList.forEach((material) => {
        gitMaterials[material.gitMaterialId] = [material.gitMaterialName.toLowerCase(), material.value]

        if (material.value === DEFAULT_GIT_BRANCH_VALUE) {
            return
        }

        const history = material.history.filter((historyItem) => historyItem.isSelected)
        if (!history.length) {
            history.push(material.history[0])
        }

        history.forEach((element) => {
            const historyItem: CIPipelineMaterialDTO = {
                Id: material.id,
                GitCommit: {
                    Commit: element.commit,
                },
            }
            if (!element.commit) {
                historyItem.GitCommit.WebhookData = {
                    id: element.webhookData.id,
                }
            }
            ciPipelineMaterials.push(historyItem)
        })
    })

    if (gitMaterials[ciConfiguredGitMaterialId][1] === DEFAULT_GIT_BRANCH_VALUE) {
        const description = CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
            '$GIT_MATERIAL_ID',
            `"${gitMaterials[ciConfiguredGitMaterialId][0]}"`,
        )
        return description
    }

    const envId = selectedEnv && selectedEnv.id !== 0 ? selectedEnv.id : undefined
    const runtimeParamsPayload = getRuntimeParamsPayload?.(runtimeParams ?? [])

    return {
        pipelineId: +ciNodeId,
        ciPipelineMaterials,
        invalidateCache,
        environmentId: envId,
        pipelineType: isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
        ...(getRuntimeParamsPayload ? runtimeParamsPayload : {}),
    }
}

export const getCanNodeHaveMaterial = (node: CommonNodeAttr): boolean =>
    !!node && node.type !== WorkflowNodeType.WEBHOOK && !node.isLinkedCD && !node.isLinkedCI

const getBulkCIWarningMessage = (ciNode: CommonNodeAttr): string => {
    if (ciNode.isLinkedCD) {
        return 'Uses another environment as image source'
    }

    if (ciNode.isLinkedCI) {
        return 'Has linked build pipeline'
    }

    if (ciNode.type === WorkflowNodeType.WEBHOOK) {
        return 'Has webhook build pipeline'
    }

    return ''
}

export const getBulkCIErrorMessage = (
    _appId: number,
    _ciNode: CommonNodeAttr,
    filteredCIPipelines: BulkCIDetailType['filteredCIPipelines'],
    materialList: CIMaterialType[],
): string => {
    const selectedCIPipeline = filteredCIPipelines?.find((_ci) => _ci.id === +_ciNode.id)

    if (materialList?.length > 0) {
        if (getIsRegexBranchNotAvailable(selectedCIPipeline, materialList)) {
            return 'Primary branch is not set'
        }

        if (selectedCIPipeline?.ciMaterial) {
            const invalidInputMaterial = materialList.find(
                (_mat) =>
                    _mat.isBranchError ||
                    _mat.isRepoError ||
                    _mat.isDockerFileError ||
                    _mat.isMaterialSelectionError ||
                    (_mat.type === SourceTypeMap.WEBHOOK && _mat.history.length === 0),
            )

            if (invalidInputMaterial) {
                if (invalidInputMaterial.isRepoError) {
                    return invalidInputMaterial.repoErrorMsg
                }
                if (invalidInputMaterial.isDockerFileError) {
                    return invalidInputMaterial.dockerFileErrorMsg
                }
                if (invalidInputMaterial.isBranchError) {
                    return invalidInputMaterial.branchErrorMsg
                }
                if (invalidInputMaterial.isMaterialSelectionError) {
                    return invalidInputMaterial.materialSelectionErrorMsg
                }
                return CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound
            }
        }
    }
    return ''
}

export const getBulkCIDataPromiseGetterList = (
    validWorkflows: WorkflowType[],
    initialDataAbortControllerRef: APIOptions['abortControllerRef'],
): GetBulkCIDataPromiseGetterListProps =>
    validWorkflows.reduce(
        (acc, workflow) => {
            const currentNode = workflow.nodes.find(
                (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
            )

            if (currentNode.isTriggerBlocked || !getCanNodeHaveMaterial(currentNode)) {
                acc.ciMaterialPromiseList.push(() => [])
                acc.runtimeParamsPromiseList.push(() => [])

                return acc
            }

            acc.ciMaterialPromiseList.push(() =>
                getCIMaterials({
                    ciNodeId: currentNode.id,
                    abortControllerRef: initialDataAbortControllerRef,
                    isCINodePresent: !!currentNode,
                    selectedWorkflow: workflow,
                }),
            )

            if (getRuntimeParams) {
                acc.runtimeParamsPromiseList.push(() => getRuntimeParams(currentNode.id))
            } else {
                acc.runtimeParamsPromiseList.push(() => [])
            }

            return acc
        },
        { ciMaterialPromiseList: [], runtimeParamsPromiseList: [] },
    )

export const parseBulkCIResponseIntoBulkCIDetail = ({
    validWorkflows,
    ciMaterialList,
    runtimeParamsList,
    filteredCIPipelineMap,
}: ParseBulkCIResponseIntoBulkCIDetailProps): Record<number, BulkCIDetailType> =>
    validWorkflows.reduce<Record<number, BulkCIDetailType>>((acc, workflow, index) => {
        const node = workflow.nodes.find(
            (currentNode) => currentNode.type === WorkflowNodeType.CI || currentNode.type === WorkflowNodeType.WEBHOOK,
        )

        if (!node) {
            return acc
        }

        const currentMaterial =
            (ciMaterialList[index].status === PromiseAllStatusType.FULFILLED ? ciMaterialList[index].value : []) || []
        const runtimeParams =
            runtimeParamsList[index].status === PromiseAllStatusType.FULFILLED ? runtimeParamsList[index].value : []

        const filteredCIPipelines = filteredCIPipelineMap.get(workflow.appId) || []

        acc[workflow.appId] = {
            workflowId: workflow.id,
            appId: workflow.appId,
            name: workflow.name,
            node,
            material: currentMaterial,
            materialInitialError:
                ciMaterialList[index].status === PromiseAllStatusType.REJECTED ? ciMaterialList[index].reason : null,
            runtimeParams: runtimeParams || [],
            runtimeParamsInitialError:
                runtimeParamsList[index].status === PromiseAllStatusType.REJECTED
                    ? runtimeParamsList[index].reason
                    : null,
            runtimeParamsErrorState: {
                isValid: runtimeParamsList[index].status !== PromiseAllStatusType.REJECTED,
                cellError: {},
            },
            warningMessage: getBulkCIWarningMessage(node),
            errorMessage: getBulkCIErrorMessage(workflow.appId, node, filteredCIPipelines, currentMaterial),
            filteredCIPipelines,
            ignoreCache: false,
            ciConfiguredGitMaterialId: workflow.ciConfiguredGitMaterialId,
        }

        return acc
    }, {})

const getPayloadFromAppDetails = (appDetails: BulkCIDetailType) =>
    getTriggerBuildPayload({
        materialList: appDetails.material,
        ciConfiguredGitMaterialId: appDetails.ciConfiguredGitMaterialId,
        runtimeParams: appDetails.runtimeParams,
        invalidateCache: appDetails.ignoreCache,
        isJobCI: appDetails.node?.isJobCI,
        ciNodeId: +(appDetails.node?.id || 0),
        selectedEnv: null,
    })

export const getTriggerCIPromiseListAndSkippedResources = (
    appList: BulkCIDetailType[],
    appsToRetry: Record<string, boolean>,
) => {
    const skippedResourceList: ResponseRowType[] = []
    const appsToTrigger = appList.filter((appDetails) => {
        if (appsToRetry && !appsToRetry[appDetails.appId]) {
            return false
        }

        if (!getCanNodeHaveMaterial(appDetails.node)) {
            skippedResourceList.push({
                appId: appDetails.appId,
                appName: appDetails.name,
                statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                status: BulkResponseStatus.SKIP,
                message: SKIPPED_RESOURCES_MESSAGE,
            })

            return false
        }

        const payload = getPayloadFromAppDetails(appDetails)

        if (typeof payload === 'string') {
            skippedResourceList.push({
                appId: appDetails.appId,
                appName: appDetails.name,
                statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                status: BulkResponseStatus.SKIP,
                message: payload,
            })

            return false
        }

        return true
    })

    const promiseList = appsToTrigger.map((appDetails) => {
        const payload = getPayloadFromAppDetails(appDetails) as Exclude<
            ReturnType<typeof getTriggerBuildPayload>,
            string
        >

        return () => triggerBuild({ payload })
    })

    return {
        promiseList,
        skippedResourceList,
        appsToTrigger,
    }
}
