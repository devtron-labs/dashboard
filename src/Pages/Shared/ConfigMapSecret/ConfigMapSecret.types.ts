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

import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import {
    ComponentStates,
    EnvironmentOverrideComponentProps,
} from '@Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'

import { CM_SECRET_STATE } from './ConfigMapSecret.constants'

export interface KeyValueYaml {
    yaml: string
    handleYamlChange: any
    error: string
}
export interface KeyValue {
    k: string
    v: string
    keyError?: string
    valueError?: string
}
export interface KeyValueValidated {
    isValid: boolean
    arr: KeyValue[]
}

export interface ConfigMapSecretFormProps
    extends Pick<
        ProtectedConfigMapSecretProps,
        | 'appChartRef'
        | 'id'
        | 'componentType'
        | 'updateCMSecret'
        | 'cmSecretStateLabel'
        | 'isJob'
        | 'reloadEnvironments'
    > {
    configMapSecretData: CMSecretConfigData
    readonlyView: boolean
    isProtectedView: boolean
    draftMode: boolean
    latestDraftData: any
    isAppAdmin?: boolean
    onCancel?: () => void
}

export interface ConfigMapSecretDataEditorContainerProps {
    componentType: CMSecretComponentType
    state: ConfigMapSecretState
    dispatch: (action: ConfigMapAction) => void
    tempArr: MutableRefObject<CMSecretYamlData[]>
    setTempArr: (arr: CMSecretYamlData[]) => void
    readonlyView: boolean
    draftMode: boolean
}

export interface DraftDetailsForCommentDrawerType {
    draftId: number
    draftVersionId: number
    index: number
}

export interface ProtectedConfigMapSecretProps
    extends Pick<
        CMSecretContainerProps,
        'appChartRef' | 'componentType' | 'isJob' | 'appName' | 'envName' | 'parentName' | 'reloadEnvironments'
    > {
    data: CMSecretConfigData
    id: number
    updateCMSecret: (name?: string) => void
    cmSecretStateLabel: CM_SECRET_STATE
    selectedTab: CMSecretProtectedTab
    draftData
}

interface ValueWithError {
    value: string
    error: string
}

export interface SecretState {
    externalType: string
    roleARN: ValueWithError
    esoData: any
    secretData: any
    secretDataYaml: string
    codeEditorRadio: string
    esoDataSecret: any
    secretStore: any
    secretStoreRef: any
    refreshInterval: any
    esoSecretYaml: string
    secretMode: boolean
    unAuthorized: boolean
}

export interface CMSecretYamlData {
    k: string
    v: string
    keyError: string
    valueError: string
    id?: string | number
}

export interface ConfigMapState {
    isFormDirty: boolean
    loading: boolean
    dialog: boolean
    subPath: string
    filePermission: ValueWithError
    currentData: CMSecretYamlData[]
    external: boolean
    externalValues: { k: string; v: any; keyError: string; valueError: string }[]
    selectedType: string
    volumeMountPath: ValueWithError
    isSubPathChecked: boolean
    externalSubpathValues: ValueWithError
    isFilePermissionChecked: boolean
    configName: ValueWithError
    yamlMode: boolean
    cmSecretState: CM_SECRET_STATE
    showDraftSaveModal: boolean
    showProtectedDeleteOverrideModal: boolean
    draftPayload: any
    isValidateFormError: boolean
}
export interface ConfigMapSecretState extends ConfigMapState, SecretState {}

export enum ConfigMapActionTypes {
    reInit = 'reInit',
    submitLoading = 'submitLoading',
    overrideLoading = 'overrideLoading',
    success = 'success',
    error = 'error',
    setExternal = 'setExternal',
    setSelectedType = 'setSelectedType',
    setVolumeMountPath = 'setVolumeMountPath',
    setIsSubPathChecked = 'setIsSubPathChecked',
    setExternalSubpathValues = 'setExternalSubpathValues',
    setIsFilePermissionChecked = 'setIsFilePermissionChecked',
    setFilePermission = 'setFilePermission',
    setConfigName = 'setConfigName',
    multipleOptions = 'multipleOptions',
    toggleYamlMode = 'toggleYamlMode',
    setExternalType = 'setExternalType',
    setSecretDataYaml = 'setSecretDataYaml',
    setEsoYaml = 'setEsoYaml',
    setSecretData = 'setSecretData',
    setRoleARN = 'setRoleARN',
    setCodeEditorRadio = 'setCodeEditorRadio',
    updateCurrentData = 'updateCurrentData',
    toggleSecretMode = 'toggleSecretMode',
    toggleUnAuthorized = 'toggleUnAuthorized',
    toggleDialog = 'toggleDialog',
    toggleProtectedDeleteOverrideModal = 'toggleProtectedDeleteOverrideModal',
    toggleDraftSaveModal = 'toggleDraftSaveModal',
    setValidateFormError = 'setValidateFormError',
    setFormDirty = 'setFormDirty',
}

export interface ConfigMapAction {
    type: ConfigMapActionTypes
    payload?: any
}

export interface ConfigDatum {
    name: string
    type: string
    external: boolean
    data: Record<string, string>
    defaultData: Record<string, string>
    global: boolean
    externalType: string
    esoSecretData: {}
    defaultESOSecretData: {}
    secretData: Record<string, string>
    defaultSecretData: Record<string, string>
    roleARN: string
    subPath: boolean
    filePermission: string
    overridden: boolean
    mountPath?: string
    defaultMountPath?: string
}

export interface CMSecret extends Omit<ConfigMapSecretData, 'configData'> {
    configData: ConfigDatum[]
}

export interface CMSecretWrapperProps
    extends Pick<
        EnvironmentOverrideComponentProps,
        'reloadEnvironments' | 'envConfig' | 'fetchEnvConfig' | 'isJob' | 'onErrorRedirectURL'
    > {
    componentType?: CMSecretComponentType
    parentName?: string
    parentState?: ComponentStates
    setParentState?: Dispatch<SetStateAction<ComponentStates>>
    isOverrideView?: boolean
    clusterId?: string
    isProtected?: boolean
    envName: string
    appName: string
}

export interface CMSecretContainerProps extends Omit<CMSecretWrapperProps, 'parentState' | 'setParentState'> {
    draftDataMap: Record<string, Record<string, number>>
    appChartRef: { id: number; version: string; name: string }
}

export interface ConfigMapSecretDeleteModalProps
    extends Pick<ConfigMapSecretFormProps, 'componentType' | 'configMapSecretData' | 'id' | 'updateCMSecret'> {
    appId: number
    envId: number
    closeDeleteModal: () => void
}

export interface CMSecretConfigData extends ConfigDatum {
    secretMode?: boolean
    unAuthorized?: boolean
    draftId?: number
    draftState?: number
}

export interface ConfigMapSecretData {
    id: number
    appId: number
    configData: CMSecretConfigData
}

export interface OverrideProps {
    overridden: boolean
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    loading?: boolean
    type: CMSecretComponentType
    readonlyView: boolean
    isProtectedView: boolean
}

export enum CMSecretComponentType {
    ConfigMap = 1,
    Secret = 2,
}

export enum CMSecretProtectedTab {
    Published = 1,
    Compare = 2,
    Draft = 3,
}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal'
