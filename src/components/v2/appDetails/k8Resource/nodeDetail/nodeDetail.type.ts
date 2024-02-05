import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { Options, OptionsBase } from '../../appDetails.type'
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
    setSelectedCustomLogFilter: React.Dispatch<
        React.SetStateAction<SelectedCustomLogFilterType>
    >
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
