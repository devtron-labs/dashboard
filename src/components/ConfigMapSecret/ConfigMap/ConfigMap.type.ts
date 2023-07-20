import { CM_SECRET_STATE } from '../Constants'

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

export interface ConfigMapState {
    loading: boolean
    dialog: boolean
    subPath: string
    filePermission: ValueWithError
    duplicate: any
    currentData: any
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
}
export interface ConfigMapSecretState extends ConfigMapState, SecretState {}

export enum ConfigMapActionTypes {
    deleteOverride = 'deleteOverride',
    submitLoading = 'submitLoading',
    overrideLoading = 'overrideLoading',
    success = 'success',
    error = 'error',
    toggleDialog = 'toggleDialog',
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
    setEsoData = 'setEsoData',
    setSecretData = 'setSecretData',
    setRoleARN = 'setRoleARN',
    setCodeEditorRadio = 'setCodeEditorRadio',
    updateCurrentData = 'updateCurrentData',
    toggleSecretMode = 'toggleSecretMode',
    toggleUnAuthorized = 'toggleUnAuthorized',
}

export interface ConfigMapAction {
    type: ConfigMapActionTypes
    payload?: any
}
