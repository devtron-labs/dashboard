import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
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

export interface SuggestedTagOptionType {
    label: string
    options: optionsListType[]
}

export interface optionsListType {
    value: string 
    descriptions: string
    format: string 
    label: string
    stageType: string
    variableType: string
}

export interface InputPluginSelectionType { 
    selectedOutputVariable: OptionType
    tagOptions?: SuggestedTagOptionType[]
    tagData?: OptionType
    setTagData?: (tagData:OptionType ) => void
    refVar?: React.MutableRefObject<HTMLTextAreaElement>
    noBackDrop?: boolean
    placeholder: string
    dependentRef?: React.MutableRefObject<HTMLTextAreaElement>
    variableType: string
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
    parentName?: string
    parentState?: ComponentStates
    setParentState?: React.Dispatch<React.SetStateAction<ComponentStates>>
    reloadEnvironments?: () => void
}

export interface ConfigMapSecretFormProps {
    appChartRef: { id: number; version: string; name: string }
    updateCollapsed: (collapse?: boolean) => void
    configMapSecretData: any
    id
    componentType: string
    update: (...args) => void
    index: number
    cmSecretStateLabel: CM_SECRET_STATE
    isJobView: boolean
    readonlyView: boolean
    isProtectedView: boolean
    draftMode: boolean
    latestDraftData: any
    reloadEnvironments?: () => void
    isAppAdmin?: boolean
}

export interface ConfigMapSecretDataEditorContainerProps {
    componentType: string
    state: ConfigMapSecretState
    dispatch: (action: ConfigMapAction) => void
    tempArr
    readonlyView: boolean
    draftMode: boolean
}

export interface DraftDetailsForCommentDrawerType {
    draftId: number
    draftVersionId: number
    index: number
}

export interface ConfigMapSecretProps {
    componentType: string
    title: string
    appChartRef: any
    update: (index?, result?) => void
    data?: any
    index?: number
    id?: number
    isOverrideView?: boolean
    isJobView: boolean
    isProtected: boolean
    toggleDraftComments?: (data: DraftDetailsForCommentDrawerType) => void
    reduceOpacity?: boolean
    parentName?: string
    reloadEnvironments?: () => void
}

export interface ProtectedConfigMapSecretDetailsProps {
    appChartRef: { id: number; version: string; name: string }
    updateCollapsed: (collapse?: boolean) => void
    data: any
    id: number
    componentType: string
    update: (...args) => void
    index: number
    cmSecretStateLabel: CM_SECRET_STATE
    isJobView: boolean
    selectedTab
    draftData
    parentName
    reloadEnvironments?: () => void
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
    showDraftSaveModal: boolean
    showProtectedDeleteModal: boolean
    showProtectedDeleteOverrideModal: boolean
    draftPayload: any
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
    toggleDeleteModal = 'toggleDeleteModal',
    toggleProtectedDeleteModal = 'setShowProtectedDeleteModal',
    toggleProtectedDeleteOverrideModal = 'toggleProtectedDeleteOverrideModal',
    toggleDraftSaveModal = 'toggleDraftSaveModal',
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
