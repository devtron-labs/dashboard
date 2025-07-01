import {
    DeploymentAppTypes,
    MaterialType,
    ReleaseMode,
    SourceTypeMap,
    TriggerType,
} from '@devtron-labs/devtron-fe-common-lib'

import { GeneratedHelmPush } from '@Components/cdPipeline/cdPipeline.types'
import { ValidationRules } from '@Components/ciPipeline/validationRules'
import { createClusterEnvGroup, getDeploymentAppType } from '@Components/common'
import { ENV_ALREADY_EXIST_ERROR } from '@Config/constants'

import { CreateCICDPipelineData, CreateCICDPipelineFormError } from './types'

export const getCiCdPipelineDefaultState = (): CreateCICDPipelineData => ({
    ci: {
        name: '',
        materials: [],
        gitHost: null,
        webhookEvents: [],
        ciPipelineSourceTypeOptions: [],
        webhookConditionList: [],
        triggerType: '',
        scanEnabled: false,
        workflowCacheConfig: null,
        isBlobStorageConfigured: false,
        isSecurityModuleInstalled: false,
        ciPipelineEditable: true,
    },
    cd: {
        name: '',
        deploymentAppType: window._env_.HIDE_GITOPS_OR_HELM_OPTION ? '' : DeploymentAppTypes.HELM,
        releaseMode: ReleaseMode.NEW_DEPLOYMENT,
        triggerType: TriggerType.Auto,
        strategies: [],
        savedStrategies: [],
        preStageConfigMapSecretNames: { configMaps: [], secrets: [] },
        postStageConfigMapSecretNames: { configMaps: [], secrets: [] },
        preBuildStage: {
            id: 0,
            triggerType: TriggerType.Auto,
            steps: [],
        },
        postBuildStage: {
            id: 0,
            triggerType: TriggerType.Auto,
            steps: [],
        },
        isClusterCdActive: false,
        deploymentAppCreated: false,
        clusterName: '',
        clusterId: null,
        runPreStageInEnv: false,
        runPostStageInEnv: false,
        containerRegistryName: '',
        repoName: '',
        selectedRegistry: null,
        generatedHelmPushAction: GeneratedHelmPush.DO_NOT_PUSH,
        isDigestEnforcedForPipeline: false,
        isDigestEnforcedForEnv: false,
        selectedEnvironment: null,
        environments: [],
    },
})

export const getCiCdPipelineFormErrorDefaultState = (): CreateCICDPipelineFormError => ({ ci: {}, cd: {} })

export const getSelectedMaterial = ({
    type,
    selectedWebhookEvent,
    ciPipelineSourceTypeOptions,
    isBranchRegex,
}: Required<
    Pick<MaterialType, 'type'> &
        Pick<CreateCICDPipelineData['ci'], 'ciPipelineSourceTypeOptions'> & {
            selectedWebhookEvent: CreateCICDPipelineData['ci']['webhookEvents'][number]
            isBranchRegex: boolean
        }
>) => {
    if (type === SourceTypeMap.WEBHOOK && !selectedWebhookEvent) {
        return null
    }

    if (ciPipelineSourceTypeOptions.length === 1) {
        return ciPipelineSourceTypeOptions[0]
    }

    return (
        ciPipelineSourceTypeOptions.find((i) => {
            if (i.value === SourceTypeMap.WEBHOOK) {
                return i.isSelected
            }

            return isBranchRegex ? i.value === SourceTypeMap.BranchRegex : i.value === type
        }) || ciPipelineSourceTypeOptions[0]
    )
}

export const getBranchValue = ({
    selectedMaterial,
    isBranchRegex,
    regex,
    value,
}: Required<
    Pick<MaterialType, 'regex' | 'value'> & {
        selectedMaterial: CreateCICDPipelineData['ci']['ciPipelineSourceTypeOptions'][number]
        isBranchRegex: boolean
    }
>) => {
    if (selectedMaterial) {
        return isBranchRegex ? regex : value
    }

    return ''
}

export const getEnvironmentOptions = (environments: CreateCICDPipelineData['cd']['environments']) =>
    createClusterEnvGroup(environments, 'clusterName').map(({ label, options }) => ({
        label: `Cluster: ${label}`,
        options: options.map((option) => ({
            ...option,
            label: option.name,
            value: option.id,
        })),
    }))

export const validateCreateCICDPipelineData = (
    ciCdPipeline: CreateCICDPipelineData,
    envIds: number[],
): { isValid: boolean; ciCdPipelineFormError: CreateCICDPipelineFormError } => {
    const copyPipelineData = structuredClone(ciCdPipeline)
    const validationRules = new ValidationRules()

    let isValid = true

    const ciPipelineFormError = copyPipelineData.ci.materials.reduce<CreateCICDPipelineFormError['ci']>(
        (acc, { gitMaterialId, type, regex, value }) => {
            if (type === SourceTypeMap.BranchFixed || type === SourceTypeMap.BranchRegex) {
                const isBranchRegex = type === SourceTypeMap.BranchRegex
                const inputValue = isBranchRegex ? regex : value

                const errorObj = validationRules.sourceValue(inputValue, isBranchRegex)
                acc[gitMaterialId] = {
                    branch: errorObj.message,
                }

                if (isValid) {
                    isValid = errorObj.isValid
                }
            }

            return acc
        },
        {},
    )

    const selectedEnvId = ciCdPipeline.cd.selectedEnvironment?.id

    const cdPipelineFormError: CreateCICDPipelineFormError['cd'] = {
        environment: envIds.includes(selectedEnvId)
            ? ENV_ALREADY_EXIST_ERROR
            : validationRules.environment(selectedEnvId).message,
    }

    isValid = isValid && !Object.values(cdPipelineFormError).some(Boolean)

    return { isValid, ciCdPipelineFormError: { ci: ciPipelineFormError, cd: cdPipelineFormError } }
}

/**
 * Generates the payload for saving CI pipeline materials.
 *
 * ## Behavior:
 * - In **multi-git pipeline scenarios** (i.e., more than one material),
 *   if the user selects a **Webhook-based trigger** like "Pull Request" or "Tag Creation",
 *   we **only send the webhook material** and ignore the others.
 * - If there's only one material, return it as-is.
 *
 * ## Why:
 * Webhook triggers like PR or Tag creation are specific to a single git repository.
 * Sending multiple repositories in this context would be invalid.
 *
 * @param materials - Array of source materials for the CI pipeline configuration.
 * @returns A filtered array containing only the webhook material in multi-git + webhook scenarios,
 *          or the original array if it's single-material or not a webhook-based trigger.
 */
export const getSaveCIPipelineMaterialsPayload = (materials: MaterialType[]): MaterialType[] => {
    if (materials.length > 1) {
        const webhookMaterial = materials.find((m) => m.type === SourceTypeMap.WEBHOOK)
        return webhookMaterial ? [webhookMaterial] : []
    }
    return materials
}

const getPrePostStageInEnv = (isVirtualEnvironment: boolean, isRunPrePostStageInEnv: boolean): boolean => {
    if (isVirtualEnvironment) {
        return true
    }
    return isRunPrePostStageInEnv ?? false
}

export const getSaveCDPipelinesPayload = ({
    cd,
    appWorkflowId,
    ciPipelineId,
}: { ciPipelineId: number; appWorkflowId: number } & Pick<CreateCICDPipelineData, 'cd'>) => {
    const {
        name,
        selectedEnvironment,
        savedStrategies,
        triggerType,
        deploymentAppType,
        deploymentAppCreated,
        releaseMode,
        preStageConfigMapSecretNames,
        postStageConfigMapSecretNames,
        generatedHelmPushAction,
        containerRegistryName,
        repoName,
        isClusterCdActive,
        runPreStageInEnv,
        runPostStageInEnv,
        isDigestEnforcedForPipeline,
    } = cd

    const pipeline = {
        id: 0,
        name,
        appWorkflowId,
        ciPipelineId,
        environmentId: selectedEnvironment.id,
        namespace: selectedEnvironment.namespace,
        strategies: savedStrategies,
        parentPipelineType: 'CI_PIPELINE',
        parentPipelineId: ciPipelineId,
        isClusterCdActive: selectedEnvironment.isClusterCdActive,
        deploymentAppType: getDeploymentAppType(
            selectedEnvironment.allowedDeploymentTypes,
            deploymentAppType,
            selectedEnvironment.isVirtualEnvironment,
        ),
        deploymentAppName: '',
        releaseMode,
        deploymentAppCreated,
        triggerType: selectedEnvironment.isVirtualEnvironment ? TriggerType.Manual : triggerType,
        environmentName: selectedEnvironment.name,
        preStageConfigMapSecretNames,
        postStageConfigMapSecretNames,
        containerRegistryName: generatedHelmPushAction === GeneratedHelmPush.PUSH ? containerRegistryName : '',
        repoName: generatedHelmPushAction === GeneratedHelmPush.PUSH ? repoName : '',
        manifestStorageType: generatedHelmPushAction === GeneratedHelmPush.PUSH ? 'helm_repo' : '',
        runPreStageInEnv: getPrePostStageInEnv(
            selectedEnvironment.isVirtualEnvironment,
            isClusterCdActive && runPreStageInEnv,
        ),
        runPostStageInEnv: getPrePostStageInEnv(
            selectedEnvironment.isVirtualEnvironment,
            isClusterCdActive && runPostStageInEnv,
        ),
        preDeployStage: {},
        postDeployStage: {},
        addType: 'PARALLEL',
        isDigestEnforcedForPipeline,
        isDigestEnforcedForEnv: selectedEnvironment.isDigestEnforcedForEnv,
    }

    return [pipeline]
}
