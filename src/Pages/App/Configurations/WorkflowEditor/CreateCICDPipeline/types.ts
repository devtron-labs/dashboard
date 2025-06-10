import { Dispatch, ReactNode, SetStateAction } from 'react'

import {
    GenericModalProps,
    IconName,
    MaterialType,
    PipelineFormType,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'

export interface CreateCICDPipelineProps extends Pick<GenericModalProps, 'open' | 'onClose'> {
    appId: string
    getWorkflows: () => void
    noGitOpsModuleInstalledAndConfigured: boolean
    isGitOpsInstalledButNotConfigured: boolean
    isGitOpsRepoNotConfigured: boolean
    envIds: number[]
    reloadAppConfig: () => void
}

export interface CICDStepperProps {
    config: {
        id: string | number
        icon: IconName
        title: string
        content: ReactNode
    }[]
}

export interface CreateCICDPipelineData {
    ci: Pick<
        PipelineFormType,
        | 'name'
        | 'materials'
        | 'gitHost'
        | 'webhookEvents'
        | 'webhookConditionList'
        | 'ciPipelineEditable'
        | 'ciPipelineSourceTypeOptions'
        | 'triggerType'
        | 'scanEnabled'
        | 'workflowCacheConfig'
    > & {
        isBlobStorageConfigured: boolean
        isSecurityModuleInstalled: boolean
    }
    cd: Pick<
        PipelineFormType,
        | 'name'
        | 'triggerType'
        | 'environments'
        | 'deploymentAppType'
        | 'savedStrategies'
        | 'strategies'
        | 'releaseMode'
        | 'triggerType'
        | 'preStageConfigMapSecretNames'
        | 'postStageConfigMapSecretNames'
        | 'preBuildStage'
        | 'postBuildStage'
        | 'isClusterCdActive'
        | 'deploymentAppCreated'
        | 'clusterName'
        | 'clusterId'
        | 'runPreStageInEnv'
        | 'runPostStageInEnv'
        | 'containerRegistryName'
        | 'repoName'
        | 'selectedRegistry'
        | 'generatedHelmPushAction'
        | 'isDigestEnforcedForPipeline'
        | 'isDigestEnforcedForEnv'
    > & {
        selectedEnvironment: EnvironmentWithSelectPickerType
    }
}

export type CreateCICDPipelineFormError = {
    ci: Record<MaterialType['gitMaterialId'], { branch?: string | null }>
    cd: { environment?: string | null }
}

export interface ConfigureWebhookWrapperProps
    extends Pick<CreateCICDPipelineData['ci'], 'gitHost' | 'webhookConditionList' | 'ciPipelineEditable'> {
    selectedWebhookEvent: CreateCICDPipelineData['ci']['webhookEvents'][number]
    setCiCdPipeline: Dispatch<SetStateAction<CreateCICDPipelineData>>
}

interface CommonStepperContentProps {
    ciCdPipeline: CreateCICDPipelineData
    setCiCdPipeline: Dispatch<SetStateAction<CreateCICDPipelineData>>
    ciCdPipelineFormError: CreateCICDPipelineFormError
    setCiCdPipelineFormError: Dispatch<SetStateAction<CreateCICDPipelineFormError>>
    isCreatingWorkflow: boolean
    cdNodeCreateError: ServerErrors
}

export interface CIStepperContentProps extends CommonStepperContentProps {}

export interface CDStepperContentProps
    extends CommonStepperContentProps,
        Pick<
            CreateCICDPipelineProps,
            | 'appId'
            | 'noGitOpsModuleInstalledAndConfigured'
            | 'isGitOpsInstalledButNotConfigured'
            | 'isGitOpsRepoNotConfigured'
            | 'envIds'
        > {
    onRetry: () => Promise<void>
    setReloadNoGitOpsRepoConfiguredModal: Dispatch<SetStateAction<boolean>>
}
