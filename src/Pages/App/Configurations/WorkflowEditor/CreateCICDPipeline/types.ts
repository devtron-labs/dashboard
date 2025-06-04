import { Dispatch, ReactNode, SetStateAction } from 'react'

import { GenericModalProps, IconName, PipelineFormType } from '@devtron-labs/devtron-fe-common-lib'

export interface CreateCICDPipelineProps extends Pick<GenericModalProps, 'open' | 'onClose'> {
    appId: string
}

export interface CICDStepperProps {
    config: {
        id: string | number
        icon: IconName
        title: string
        content: ReactNode
    }[]
}

export interface CreateCICDPipelineData
    extends Pick<
        PipelineFormType,
        | 'materials'
        | 'gitHost'
        | 'webhookEvents'
        | 'webhookConditionList'
        | 'ciPipelineEditable'
        | 'ciPipelineSourceTypeOptions'
        | 'triggerType'
        | 'scanEnabled'
        | 'workflowCacheConfig'
    > {
    isBlobStorageConfigured: boolean
}

export type CreateCICDPipelineFormError = Record<
    CreateCICDPipelineData['materials'][number]['gitMaterialId'],
    { branch: string | null }
>

export interface ConfigureWebhookWrapperProps
    extends Pick<CreateCICDPipelineData, 'gitHost' | 'webhookEvents' | 'webhookConditionList' | 'ciPipelineEditable'> {
    selectedWebhookEvent: CreateCICDPipelineData['webhookEvents'][number]
    setCiCdPipeline: Dispatch<SetStateAction<CreateCICDPipelineData>>
}

export interface CIStepperContentProps
    extends Omit<ConfigureWebhookWrapperProps, 'selectedWebhookEvent'>,
        Pick<CreateCICDPipelineData, 'materials' | 'ciPipelineSourceTypeOptions'> {
    ciCdPipeline: CreateCICDPipelineData
    ciCdPipelineFormError: CreateCICDPipelineFormError
    setCiCdPipelineFormError: Dispatch<SetStateAction<CreateCICDPipelineFormError>>
}

export interface CDStepperContentProps {}
