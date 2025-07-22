import { CIMaterialType, CommonNodeAttr, WorkflowNodeType } from '@devtron-labs/devtron-fe-common-lib'

import { CIPipelineBuildType } from '@Components/ciPipeline/types'
import { importComponentFromFELibrary } from '@Components/common'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR } from '@Config/constantMessaging'
import { DEFAULT_GIT_BRANCH_VALUE } from '@Config/constants'

import { BuildImageModalProps, CIPipelineMaterialDTO } from '../types'
import { GetTriggerBuildPayloadProps, TriggerBuildPayloadType } from './types'

const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')

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
            // FIXME: Will include/exclude impact this?
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
