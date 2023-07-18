import { OptionType } from '@devtron-labs/devtron-fe-common-lib';
import React from 'react'
import {Options, OptionsBase } from "../../appDetails.type";

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
