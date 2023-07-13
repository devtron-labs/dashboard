import React from 'react'

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
    appId: string
    envId: string
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
    ephemeralForm: EphemeralForm
    setEphemeralForm: React.Dispatch<React.SetStateAction<EphemeralForm>>
    setEphemeralContainerDrawer: React.Dispatch<React.SetStateAction<boolean>>
    params: ParamsType
    setEphemeralFormAdvanced: React.Dispatch<React.SetStateAction<EphemeralFormAdvancedType>>
    ephemeralFormAdvanced: EphemeralFormAdvancedType
    containerList
    setContainers        : any
}

export interface ResponsePayload {
    namespace: string
    clusterId: number
    podName:string
    basicData?: {
      targetContainerName: string
      containerName: string
      image: string
    }

  advancedData?: {
    manifest: string
  }
}