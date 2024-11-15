import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import {
    ConfigDatum,
    CMSecretExternalType,
    DraftAction,
    DraftMetadataDTO,
    ProtectConfigTabsType,
    SelectPickerOptionType,
    useForm,
    UseFormErrorHandler,
    UseFormErrors,
    UseFormSubmitHandler,
    AppEnvDeploymentConfigDTO,
    DryRunEditorMode,
    ConfigHeaderTabType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConfigToolbarProps } from '@Pages/Applications'

import { ComponentStates, EnvironmentOverrideComponentProps } from '../EnvironmentOverride/EnvironmentOverrides.types'

// ENUMS
export enum CMSecretComponentType {
    ConfigMap = 1,
    Secret = 2,
}

export enum CM_SECRET_STATE {
    BASE = '',
    INHERITED = 'INHERITING',
    OVERRIDDEN = 'OVERRIDDEN',
    ENV = 'ENV',
    UNPUBLISHED = 'UNPUBLISHED',
}

// PAYLOAD PROPS
export type CMSecretPayloadType = Pick<
    CMSecretConfigData,
    | 'data'
    | 'name'
    | 'type'
    | 'externalType'
    | 'external'
    | 'roleARN'
    | 'mountPath'
    | 'subPath'
    | 'esoSecretData'
    | 'filePermission'
    | 'esoSubPath'
    | 'mergeStrategy'
>

export interface ESOSecretData {
    secretStore: Record<string, any>
    secretStoreRef: Record<string, any>
    refreshInterval: string
    esoData: Record<string, any>[]
    esoDataFrom: Record<string, any>[]
    template: Record<string, any>
}

export interface CMSecretDraftPayloadType {
    id: number
    appId: number
    configData: [CMSecretPayloadType]
    environmentId: number
}

export interface GetConfigMapSecretConfigDataProps<IsJob extends boolean>
    extends Pick<ConfigMapSecretContainerProps, 'appName' | 'envName' | 'componentType'> {
    envId: number
    appId: number
    name: string
    isJob?: IsJob
    resourceId: number
    abortControllerRef: MutableRefObject<AbortController>
}

export type GetConfigMapSecretConfigDataReturnType<IsJob extends boolean> = IsJob extends true
    ? CMSecretDTO
    : AppEnvDeploymentConfigDTO

// SELECT PICKER OPTION TYPE
export type ConfigMapSecretDataTypeOptionType = SelectPickerOptionType<string>

// USE FORM PROPS
export interface CMSecretYamlData {
    k: string
    v: string
    id: string | number
}

export interface ConfigMapSecretUseFormProps {
    name: string
    isSecret: boolean
    external: boolean
    externalType: CMSecretExternalType
    selectedType: string
    isFilePermissionChecked: boolean
    isSubPathChecked: boolean
    externalSubpathValues: string
    filePermission: string
    volumeMountPath: string
    roleARN: string
    yamlMode: boolean
    yaml: string
    currentData: CMSecretYamlData[]
    secretDataYaml: string
    esoSecretYaml: string
    hasCurrentDataErr: boolean
    isResolvedData: boolean
    replaceData: CMSecretYamlData[]
    replaceYaml: string
    mergeStrategy: ConfigToolbarProps['mergeStrategy']
}

// COMPONENT PROPS
export interface CMSecretDraftData extends DraftMetadataDTO {
    unAuthorized: boolean
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
    clusterId?: string
    isProtected?: boolean
    envName: string
    appName: string
}

export interface ConfigMapSecretContainerProps extends Omit<CMSecretWrapperProps, 'parentState' | 'setParentState'> {
    appChartRef: { id: number; version: string; name: string }
}

export interface CMSecretConfigData extends ConfigDatum {
    unAuthorized: boolean
}

export interface ConfigMapSecretFormProps
    extends Required<Pick<ConfigMapSecretContainerProps, 'isJob' | 'isProtected' | 'componentType' | 'appChartRef'>> {
    id: number
    configMapSecretData: CMSecretConfigData
    cmSecretStateLabel: CM_SECRET_STATE
    restoreYAML: boolean
    setRestoreYAML: Dispatch<SetStateAction<boolean>>
    isSubmitting: boolean
    areScopeVariablesResolving: boolean
    resolvedFormData: ConfigMapSecretUseFormProps
    isDraft?: boolean
    mergeStrategy: ConfigToolbarProps['mergeStrategy']
    onSubmit: UseFormSubmitHandler<ConfigMapSecretUseFormProps>
    onError: UseFormErrorHandler<ConfigMapSecretUseFormProps>
    onCancel: () => void
}

export interface ConfigMapSecretDataProps {
    isESO: boolean
    isHashiOrAWS: boolean
    isUnAuthorized: boolean
    readOnly: boolean
    isPatchMode: boolean
    useFormProps: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>
}

export interface ConfigMapSecretReadyOnlyProps
    extends Pick<
        ConfigMapSecretFormProps,
        'configMapSecretData' | 'componentType' | 'isJob' | 'areScopeVariablesResolving'
    > {
    hideCodeEditor?: boolean
}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal'

export interface ConfigMapSecretDeleteModalProps
    extends Pick<ConfigMapSecretFormProps, 'componentType' | 'id' | 'cmSecretStateLabel'> {
    appId: number
    envId: number
    configName: string
    openDeleteModal: CMSecretDeleteModalType
    draftData: CMSecretDraftData
    updateCMSecret: (configName?: string) => void
    closeDeleteModal: () => void
    handleError: (actionType: DraftAction, err: any, payloadData?: CMSecretPayloadType) => void
}

export type ConfigMapSecretNullStateProps =
    | {
          componentType?: never
          componentName: string
          nullStateType: 'DELETE'
      }
    | {
          componentType?: never
          componentName?: never
          nullStateType: 'DELETE_OVERRIDE' | 'NOT_OVERRIDDEN'
      }
    | {
          componentType: ConfigMapSecretFormProps['componentType']
          componentName?: never
          nullStateType: 'NO_CM_CS'
      }

export type ConfigMapSecretProtectedProps = Pick<ConfigMapSecretContainerProps, 'parentName'> &
    Pick<
        ConfigMapSecretFormProps,
        | 'componentType'
        | 'cmSecretStateLabel'
        | 'isJob'
        | 'id'
        | 'onError'
        | 'onSubmit'
        | 'areScopeVariablesResolving'
        | 'resolvedFormData'
        | 'restoreYAML'
        | 'setRestoreYAML'
        | 'appChartRef'
        | 'mergeStrategy'
    > &
    Pick<ConfigMapSecretDeleteModalProps, 'updateCMSecret'> & {
        componentName: string
        publishedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        inheritedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        draftData: CMSecretDraftData
        selectedProtectionViewTab: ProtectConfigTabsType
    } & {
        formMethodsRef: MutableRefObject<ConfigMapSecretFormRefType>
    }

export type ConfigMapSecretDryRunProps = Pick<
    ConfigMapSecretFormProps,
    | 'cmSecretStateLabel'
    | 'componentType'
    | 'isProtected'
    | 'isSubmitting'
    | 'onSubmit'
    | 'resolvedFormData'
    | 'isJob'
    | 'areScopeVariablesResolving'
> &
    Pick<ConfigToolbarProps, 'mergeStrategy' | 'resolveScopedVariables' | 'handleToggleScopedVariablesView'> &
    Pick<
        ConfigMapSecretProtectedProps,
        | 'id'
        | 'inheritedConfigMapSecretData'
        | 'publishedConfigMapSecretData'
        | 'draftData'
        | 'updateCMSecret'
        | 'componentName'
        | 'parentName'
    > & {
        dryRunEditorMode: DryRunEditorMode
        handleChangeDryRunEditorMode: (mode: DryRunEditorMode) => void
        showCrudButtons: boolean
    }

export interface ConfigMapSecretApproveButtonProps
    extends Pick<ConfigMapSecretProtectedProps, 'updateCMSecret' | 'parentName' | 'componentName' | 'draftData'> {
    configMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
}

export interface ConfigMapSecretFormRefType extends Pick<ConfigMapSecretDataProps['useFormProps'], 'handleSubmit'> {}

// CONTEXT TYPES
type SetFormStateParams =
    | {
          type: 'SET_DATA'
          data: ConfigMapSecretUseFormProps
          errors: UseFormErrors<ConfigMapSecretUseFormProps>
          isDirty: boolean
      }
    | {
          type: 'RESET'
          data?: never
          errors?: never
          isDirty?: never
      }

export interface ConfigMapSecretFormContextType {
    /**
     * Reference to the current state of the form data.
     * This persists the form values across renders, preventing data loss when the component unmounts.
     */
    formDataRef: MutableRefObject<ConfigMapSecretUseFormProps>
    /**
     * Boolean indicating whether the form has unsaved changes.
     * This tracks the "dirty" state of the form.
     */
    isFormDirty: boolean
    /**
     * String containing any error messages related to parsing, \
     * such as issues encountered when processing YAML.
     */
    parsingError: string
    /**
     * Function to update the form state based on the provided parameters.
     * @param params - The new form state parameters to apply.
     */
    setFormState: (params: SetFormStateParams) => void
}

export interface ConfigMapSecretFormProviderProps {
    children: JSX.Element
}

// DTO
export interface CMSecretDTO {
    id: number
    appId: number
    configData: ConfigDatum[]
}

// API CALLS PROPS
export interface ConfigMapSecretCommonAPIProps {
    id: number
    appId: number
    envId: number
    name: string
    payload: CMSecretPayloadType
    signal?: AbortSignal
}

export interface UpdateConfigMapSecretProps
    extends Pick<ConfigMapSecretCommonAPIProps, 'appId' | 'id' | 'payload' | 'signal'> {}

export interface DeleteConfigMapSecretProps extends Pick<ConfigMapSecretCommonAPIProps, 'id' | 'appId' | 'name'> {}

export interface DeleteEnvConfigMapSecretProps
    extends DeleteConfigMapSecretProps,
        Pick<ConfigMapSecretCommonAPIProps, 'envId'> {}

export interface OverrideConfigMapSecretProps
    extends Pick<ConfigMapSecretCommonAPIProps, 'appId' | 'envId' | 'payload' | 'signal'> {}

export interface GetCMSecretProps extends Pick<ConfigMapSecretCommonAPIProps, 'id' | 'appId' | 'name' | 'signal'> {
    componentType: CMSecretComponentType
    envId?: number
}

// UTILS TYPES
export type ConfigMapSecretDecodedDataReturnType<IsDraft extends boolean> = IsDraft extends false
    ? CMSecretConfigData & { isDecoded?: boolean }
    : CMSecretDraftData & { isDecoded?: boolean; parsedData?: Record<string, any> }

export type ConfigMapSecretEncodedDataReturnType<IsDraft extends boolean> = IsDraft extends false
    ? CMSecretConfigData
    : CMSecretDraftData

export type ConfigMapSecretDecodedDataProps<IsDraft extends boolean> = {
    configMapSecretData: ConfigMapSecretEncodedDataReturnType<IsDraft>
    isDraft?: IsDraft
    isSecret?: boolean
}

export type ConfigMapSecretEncodedDataProps<IsDraft extends boolean> = {
    configMapSecretData: ConfigMapSecretDecodedDataReturnType<IsDraft>
    isDraft?: IsDraft
}

export interface ConfigMapSecretQueryParamsType {
    tab: ConfigHeaderTabType
}
