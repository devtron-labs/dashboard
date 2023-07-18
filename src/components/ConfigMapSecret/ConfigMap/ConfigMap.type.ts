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
export interface ConfigMapSecretState extends ConfigMapAction, SecretState {

}

export enum ConfigMapActionTypes {
    createDuplicate = 'createDuplicate',
    deleteOverride = 'deleteOverride',
    addParam = 'addParam',
    keyValueChange = 'keyValueChange',
    keyValueDelete = 'keyValueDelete',
    submitLoading = 'submitLoading',
    overrideLoading = 'overrideLoading',
    createErrors = 'createErrors',
    success = 'success',
    error = 'error',
    toggleDialog = 'toggleDialog',
    setExternal = 'setExternal',
    setSelectedType = 'setSelectedType',
    setVolumeMountPath = 'setVolumeMountPath',
    yamlToValues = 'yamlToValues',
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
    setExternalValues = 'setExternalValues',
    setCodeEditorRadio = 'setCodeEditorRadio',
    unlock = 'unlock',
    toggleSecretMode = 'toggleSecretMode',
}

export interface ConfigMapAction {
    type: ConfigMapActionTypes
    payload?: any
}
