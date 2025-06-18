import {
    DeploymentAppTypes,
    DeploymentStrategy,
    getEnvironmentListMinPublic,
    ModuleNameMap,
    ModuleStatus,
    ReleaseMode,
    SavedDeploymentStrategy,
    showError,
    TriggerType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCDPipelineNameSuggestion, getDeploymentStrategyList } from '@Components/cdPipeline/cdPipeline.service'
import { GeneratedHelmPush } from '@Components/cdPipeline/cdPipeline.types'
import { getInitData } from '@Components/ciPipeline/ciPipeline.service'
import { sortObjectArrayAlphabetically } from '@Components/common'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'

import { CreateCICDPipelineData } from './types'

const getSavedStrategies = (strategies: DeploymentStrategy[]): SavedDeploymentStrategy[] => {
    if (strategies.length > 0) {
        const allStrategies = strategies.reduce((acc, strategy) => {
            acc[strategy.deploymentTemplate] = strategy.config

            return acc
        }, {})

        const defaultStrategy = strategies.find((strategy) => strategy.default)

        return [
            {
                deploymentTemplate: defaultStrategy.deploymentTemplate,
                defaultConfig: allStrategies[defaultStrategy.deploymentTemplate],
                config: allStrategies[defaultStrategy.deploymentTemplate],
                isCollapsed: true,
                default: true,
                jsonStr: JSON.stringify(allStrategies[defaultStrategy.deploymentTemplate], null, 4),
                yamlStr: YAMLStringify(allStrategies[defaultStrategy.deploymentTemplate]),
            },
        ]
    }

    return []
}

const getCDInitData = async (appId: string): Promise<CreateCICDPipelineData['cd']> => {
    const [pipelineStrategyResponse, cpPipelineName, envList] = await Promise.all([
        getDeploymentStrategyList(appId, false),
        getCDPipelineNameSuggestion(appId, false),
        getEnvironmentListMinPublic(true),
    ])
    const strategies = pipelineStrategyResponse.result.pipelineStrategy || []
    const savedStrategies = getSavedStrategies(strategies)

    const list = (envList.result || []).map((env) => ({
        id: env.id,
        clusterId: env.cluster_id,
        clusterName: env.cluster_name,
        name: env.environment_name,
        namespace: env.namespace || '',
        active: false,
        isClusterCdActive: env.isClusterCdActive,
        description: env.description,
        isVirtualEnvironment: env.isVirtualEnvironment,
        allowedDeploymentTypes: env.allowedDeploymentTypes || [],
        isDigestEnforcedForEnv: env.isDigestEnforcedForEnv,
    }))

    return {
        name: cpPipelineName.result,
        environments: sortObjectArrayAlphabetically(list, 'name'),
        savedStrategies,
        strategies,
        releaseMode: ReleaseMode.NEW_DEPLOYMENT,
        deploymentAppType: window._env_.HIDE_GITOPS_OR_HELM_OPTION ? '' : DeploymentAppTypes.HELM,
        triggerType: TriggerType.Auto,
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
        repoName: '',
        clusterId: null,
        runPreStageInEnv: false,
        runPostStageInEnv: false,
        containerRegistryName: '',
        selectedRegistry: null,
        generatedHelmPushAction: GeneratedHelmPush.DO_NOT_PUSH,
        isDigestEnforcedForPipeline: false,
        isDigestEnforcedForEnv: false,
        selectedEnvironment: null,
    }
}

const getCIInitData = async (appId: string) => {
    const [
        {
            result: { form, isBlobStorageConfigured },
        },
        {
            result: { status },
        },
    ] = await Promise.all([getInitData(appId.toString(), true, false, false), getModuleInfo(ModuleNameMap.SECURITY)])

    return {
        ...form,
        isBlobStorageConfigured,
        isSecurityModuleInstalled: status === ModuleStatus.INSTALLED,
    }
}

export const getCICDPipelineInitData = async (appId: string): Promise<CreateCICDPipelineData> => {
    try {
        const [ci, cd] = await Promise.all([getCIInitData(appId), getCDInitData(appId)])

        return { ci, cd }
    } catch (err) {
        showError(err)
        throw err
    }
}
