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

import React from 'react'
import {
    OptionType,
    SelectPickerOptionType,
    OptionsBase,
    SelectedResourceType,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppDetails, Options } from '../../appDetails.type'
import { CUSTOM_LOGS_FILTER, MANIFEST_KEY_FIELDS } from '../../../../../config'
import { CustomLogFilterOptionsType, SelectedCustomLogFilterType } from './NodeDetailTabs/node.type'

export enum NodeDetailTab {
    EVENTS = 'EVENTS',
    LOGS = 'LOGS',
    MANIFEST = 'MANIFEST',
    DESCRIBE = 'DESCRIBE',
    TERMINAL = 'TERMINAL',
    SUMMARY = 'SUMMARY',
}

export type EphemeralKeyType = 'containerName' | 'manifest' | 'image' | 'targetContainerName'

export interface ParamsType {
    actionName: string
    podName: string
    nodeType: string
    node: string
    appId?: string
    envId?: string
    namespace?: string
    clusterId?: string
    group?: string
}
export interface EphemeralForm {
    basicData: {
        targetContainerName: string
        containerName: string
        image: string
    }
}

export interface EphemeralFormAdvancedType {
    advancedData?: {
        manifest: string
    }
}
export interface EphemeralContainerDrawerType {
    setShowEphemeralContainerDrawer: React.Dispatch<React.SetStateAction<boolean>>
    params: ParamsType
    setResourceContainers: React.Dispatch<React.SetStateAction<OptionsBase[]>>
    ephemeralContainerType: string
    setEphemeralContainerType: React.Dispatch<React.SetStateAction<string>>
    targetContainerOption: OptionType[]
    setTargetContainerOption?: React.Dispatch<React.SetStateAction<OptionType[]>>
    imageListOption: OptionType[]
    setImageListOption?: React.Dispatch<React.SetStateAction<OptionType[]>>
    isResourceBrowserView: boolean
    containers?: Options[]
    setContainers?: React.Dispatch<React.SetStateAction<Options[]>>
    switchSelectedContainer: (string) => void
    onClickShowLaunchEphemeral: () => void
    selectedNamespaceByClickingPod?: string
    handleSuccess?: () => void
}

export interface ResponsePayload {
    namespace: string
    clusterId: number
    podName: string
    basicData?: {
        targetContainerName?: string
        containerName: string
        image?: string
    }

    advancedData?: {
        manifest: string
    }
}

interface ManagedFields {
    [key: string]: any
}

interface ManifestMetadata {
    [MANIFEST_KEY_FIELDS.MANAGED_FIELDS]?: ManagedFields[]
    [key: string]: any
}

export interface ManifestData {
    [MANIFEST_KEY_FIELDS.METADATA]?: ManifestMetadata
    [key: string]: any
}

export interface CustomLogsModalProps {
    setSelectedCustomLogFilter: React.Dispatch<React.SetStateAction<SelectedCustomLogFilterType>>
    selectedCustomLogFilter: SelectedCustomLogFilterType
    setNewFilteredLogs: React.Dispatch<React.SetStateAction<boolean>>
    setLogsShownOption: React.Dispatch<
        React.SetStateAction<{
            prev: { label: string; value: string; type: CUSTOM_LOGS_FILTER }
            current: { label: string; value: string; type: CUSTOM_LOGS_FILTER }
        }>
    >
    setShowCustomOptionsMoadal: React.Dispatch<React.SetStateAction<boolean>>
}

export interface InputSelectionProps {
    customLogFilterOptions: CustomLogFilterOptionsType
    setCustomLogFilterOptions: React.Dispatch<React.SetStateAction<CustomLogFilterOptionsType>>
    filterTypeRadio: string
}

export interface AppDetailsAppIdentifierProps {
    clusterId: number
    namespace: string
    appName: string
    templateType?: string
}

export interface EphemeralContainerProps {
    requestData: ResponsePayload
    clusterId: number
    environmentId: number
    namespace: string
    appName: string
    appId: number
    appType: string
    fluxTemplateType: string
    isResourceBrowserView: boolean
    params: ParamsType
}

export interface GetResourceRequestPayloadParamsType {
    appDetails: AppDetails
    nodeName: string
    nodeType: string
    isResourceBrowserView?: boolean
    selectedResource?: SelectedResourceType
    updatedManifest?: string
}
export interface EphemeralContainerOptionsType extends SelectPickerOptionType {
    isExternal: boolean
    isEphemeralContainer: boolean
}

export interface DeleteEphemeralButtonType {
    containerName: string
    isResourceBrowserView: boolean
    selectedNamespace: string
    selectedClusterId: number
    selectedPodName: string
    switchSelectedContainer: (string) => void
    setContainers: React.Dispatch<React.SetStateAction<Options[]>>
    containers: Options[]
    isExternal: boolean
}
