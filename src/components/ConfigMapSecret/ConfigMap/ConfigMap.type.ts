interface ValueWithError {
    value: string
    error: ''
}

export interface ConfigMapState {
    mountPath: string
    loading: boolean
    dialog: boolean
    subPath: string
    filePermission: ValueWithError
    duplicate: any
    external: boolean
    selectedType: string
    volumeMountPath: ValueWithError
    isSubPathChecked: boolean
    externalSubpathValues: ValueWithError
    isFilePermissionChecked: boolean
    configName: ValueWithError
    yamlMode: boolean
}

export enum ConfigMapActionTypes {
    createDuplicate = 'createDuplicate',
    removeDuplicate = 'removeDuplicate',
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
    toggleYamlMode='toggleYamlMode',
    setExternalType = 'setExternalType',
}

export interface ConfigMapAction {
    type: ConfigMapActionTypes
    payload?: any
}
