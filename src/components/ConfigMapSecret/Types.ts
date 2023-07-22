import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { CM_SECRET_STATE } from './Constants'

export interface KeyValueInputInterface {
    keyLabel: string
    valueLabel: string
    k: string
    v: string
    index: number
    onChange: any
    onDelete: any
    keyError?: string
    valueError?: string
    valueType?: string
}

export interface ResizableTextareaProps {
    minHeight?: number
    maxHeight?: number
    value?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    onFocus?: (e) => void
    className?: string
    placeholder?: string
    lineHeight?: number
    padding?: number
    disabled?: boolean
    name?: string
    dataTestId?: string
}

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

export interface ConfigMapListProps {
    isJobView?: boolean
    isOverrideView?: boolean
    isProtected?: boolean
    parentState?: ComponentStates
    setParentState?: React.Dispatch<React.SetStateAction<ComponentStates>>
}

export interface ConfigMapSecretFormProps {
    appChartRef: { id: number; version: string; name: string }
    toggleCollapse: React.Dispatch<React.SetStateAction<boolean>>
    configMapSecretData: any
    id
    isOverrideView: boolean
    componentType: string
    update: (...args) => void
    index: number
    cmSecretStateLabel: CM_SECRET_STATE
    isJobView: boolean
    draftData: string
}

export interface ConfigMapSecretDataEditorContainerProps {
    componentType: string
    state
    dispatch
    tempArr
}

export interface ConfigMapSecretProps {
    componentType: string
    title: string
    appChartRef: any
    update: (index, result) => void
    data?: any
    index?: number
    id?: number
    isOverrideView?: boolean
    isJobView: boolean
    isProtected: boolean
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
    showDeleteModal: boolean
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
    setShowDeleteModal = 'setShowDeleteModal',
}

export interface ConfigMapAction {
    type: ConfigMapActionTypes
    payload?: any
}

export interface InfoIconWithTippyType {
    titleText: string
    infoText: string
    documentationLink: string
}


