import { BuildStageType, FormType } from '@Common/CIPipeline.Types'
import { DeploymentAppTypes, UserApprovalConfigType } from '@Common/Types'
import { DeploymentStrategy } from '@Shared/Components'
import { EnvListMinDTO } from '@Shared/types'

interface ConfigSecretType {
    label: string
    value: string
    type: string
}

export interface Environment
    extends Pick<EnvListMinDTO, 'id' | 'active' | 'namespace' | 'isClusterCdActive'>,
        Partial<
            Pick<
                EnvListMinDTO,
                'isVirtualEnvironment' | 'allowedDeploymentTypes' | 'description' | 'isDigestEnforcedForEnv'
            >
        > {
    name: string
    clusterName: string
    clusterId: string
}

export interface PipelineBuildStageType extends BuildStageType {
    triggerType?: string
}

export interface SavedDeploymentStrategy extends DeploymentStrategy {
    isCollapsed?: boolean
    defaultConfig?: any
    yamlStr?: any
    jsonStr?: any
}

export interface CustomTagType {
    tagPattern: string
    counterX: string
}

export enum ReleaseMode {
    NEW_DEPLOYMENT = 'create',
    MIGRATE_HELM = 'link',
}

export interface CDFormType {
    name: string
    ciPipelineId: number
    environmentId: number
    environmentName: string
    namespace: string
    environments: Environment[]
    deploymentAppType: string
    deploymentAppName?: string
    releaseMode: ReleaseMode
    triggerType: string
    preBuildStage?: PipelineBuildStageType
    postBuildStage?: PipelineBuildStageType
    strategies: DeploymentStrategy[]
    savedStrategies: SavedDeploymentStrategy[]
    preStageConfigMapSecretNames: { configMaps: ConfigSecretType[]; secrets: ConfigSecretType[] }
    postStageConfigMapSecretNames: { configMaps: ConfigSecretType[]; secrets: ConfigSecretType[] }
    requiredApprovals: string
    userApprovalConfig?: UserApprovalConfigType
    isClusterCdActive: boolean
    deploymentAppCreated: boolean
    clusterId: string
    clusterName: string
    runPreStageInEnv: boolean
    runPostStageInEnv: boolean
    allowedDeploymentTypes: DeploymentAppTypes[]
    containerRegistryName: string
    repoName: string
    selectedRegistry: any
    generatedHelmPushAction: string
}

export interface PipelineFormType extends Partial<FormType>, Partial<CDFormType> {
    name: string
    triggerType: string
    preBuildStage?: PipelineBuildStageType
    postBuildStage?: PipelineBuildStageType
    defaultTag?: string[]
    customTag?: CustomTagType
    enableCustomTag?: boolean
    customTagStage?: string
    isDigestEnforcedForPipeline?: boolean
    isDigestEnforcedForEnv?: boolean
}
