import { CIMaterialProps, RuntimeParamsErrorState, TriggerViewState } from '@Components/app/details/triggerView/types'
import { CIMaterialType } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'

export interface GitInfoMaterialProps
    extends Pick<TriggerViewState, 'workflowId'>,
        Pick<
            CIMaterialProps,
            | 'onClickShowBranchRegexModal'
            | 'fromAppGrouping'
            | 'isJobView'
            | 'isJobCI'
            | 'isCITriggerBlocked'
            | 'handleRuntimeParamChange'
            | 'pipelineId'
            | 'runtimeParams'
            | 'appId'
            | 'uploadFile'
        > {
    dataTestId?: string
    material: CIMaterialType[]
    title: string
    pipelineName: string
    selectedMaterial: CIMaterialType

    // Only coming from BulkCI
    appName?: string
    fromBulkCITrigger?: boolean
    hideSearchHeader?: boolean

    // Not required for BulkCI
    currentSidebarTab?: string
    handleSidebarTabChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    handleRuntimeParamError: (errorState: RuntimeParamsErrorState) => void
    isBulkCIWebhook?: boolean
    webhookPayloads?: any
    isWebhookPayloadLoading?: boolean
    setIsWebhookBulkCI?: React.Dispatch<React.SetStateAction<boolean>>
    isBulk?: boolean
}

export interface ReceivedWebhookRedirectButtonType {
    setIsWebhookBulkCI?: React.Dispatch<React.SetStateAction<boolean>>
    isBulk?: boolean
}
