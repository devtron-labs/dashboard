/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
