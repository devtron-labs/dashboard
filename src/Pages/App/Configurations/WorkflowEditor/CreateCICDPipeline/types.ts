import { Dispatch, ReactNode, SetStateAction } from 'react'

import { GenericModalProps, IconName, PipelineFormType, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'

export interface CreateCICDPipelineProps extends Pick<GenericModalProps, 'open' | 'onClose'> {
    workflowId: number
    appId: string
    getWorkflows: () => void
}

export interface CICDStepperProps {
    config: {
        id: string | number
        icon: IconName
        title: string
        content: ReactNode
    }[]
}

export interface CreateCICDPipelineData extends PipelineFormType {
    isBlobStorageConfigured: boolean
    isSecurityModuleInstalled: boolean
}

export type CreateCICDPipelineFormError = Record<
    CreateCICDPipelineData['materials'][number]['gitMaterialId'],
    { branch: string | null }
>

export interface ConfigureWebhookWrapperProps
    extends Pick<CreateCICDPipelineData, 'gitHost' | 'webhookConditionList' | 'ciPipelineEditable'> {
    selectedWebhookEvent: CreateCICDPipelineData['webhookEvents'][number]
    setCiCdPipeline: Dispatch<SetStateAction<CreateCICDPipelineData>>
}

interface CommonStepperContentProps {
    ciCdPipeline: CreateCICDPipelineData
    ciCdPipelineFormError: CreateCICDPipelineFormError
    setCiCdPipelineFormError: Dispatch<SetStateAction<CreateCICDPipelineFormError>>
    isCreatingWorkflow: boolean
    cdNodeCreateError: ServerErrors
}

export interface CIStepperContentProps
    extends CommonStepperContentProps,
        Omit<ConfigureWebhookWrapperProps, 'selectedWebhookEvent'>,
        Pick<CreateCICDPipelineData, 'materials' | 'ciPipelineSourceTypeOptions' | 'webhookEvents'> {}

export interface CDStepperContentProps extends CommonStepperContentProps {
    onRetry: () => Promise<void>
}
