import { Dispatch, MutableRefObject, SetStateAction } from 'react'

import {
    CMSecretConfigData,
    ConfigMapSecretUseFormProps,
    DraftAction,
    DraftMetadataDTO,
    ProtectConfigTabsType,
    SelectPickerOptionType,
    useForm,
    UseFormErrorHandler,
    UseFormSubmitHandler,
    AppEnvDeploymentConfigDTO,
    DryRunEditorMode,
    ConfigHeaderTabType,
    OverrideMergeStrategyType,
    ConfigMapSecretDataType,
    CMSecretComponentType,
    CM_SECRET_STATE,
    CMSecretPayloadType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConfigToolbarProps } from '@Pages/Applications'

import { ComponentStates, EnvironmentOverrideComponentProps } from '../EnvironmentOverride/EnvironmentOverrides.types'

// PAYLOAD PROPS
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
    ? ConfigMapSecretDataType
    : AppEnvDeploymentConfigDTO

// SELECT PICKER OPTION TYPE
export type ConfigMapSecretDataTypeOptionType = SelectPickerOptionType<string>

// COMPONENT PROPS
export interface CMSecretDraftData extends Omit<DraftMetadataDTO, 'data'> {
    unAuthorized: boolean
    parsedData: ConfigMapSecretDataType
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
    isApprovalPolicyConfigured?: boolean
    envName: string
    appName: string
}

export interface ConfigMapSecretContainerProps extends Omit<CMSecretWrapperProps, 'parentState' | 'setParentState'> {
    appChartRef: { id: number; version: string; name: string }
}

type CMCSFormBaseProps =
    | {
          isExternalSubmit: true
          onSubmit?: never
          onError?: never
          onCancel?: never
      }
    | {
          isExternalSubmit?: never
          onSubmit: UseFormSubmitHandler<ConfigMapSecretUseFormProps>
          onError: UseFormErrorHandler<ConfigMapSecretUseFormProps>
          onCancel: () => void
      }

export type ConfigMapSecretFormProps = Required<
    Pick<ConfigMapSecretContainerProps, 'isJob' | 'isApprovalPolicyConfigured' | 'componentType' | 'appChartRef'>
> &
    CMCSFormBaseProps & {
        id: number | string
        configMapSecretData: CMSecretConfigData
        inheritedConfigMapSecretData: CMSecretConfigData
        cmSecretStateLabel: CM_SECRET_STATE
        isSubmitting?: boolean
        areScopeVariablesResolving: boolean
        isDraft?: boolean
        disableDataTypeChange: boolean
        useFormProps: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>
    }

export interface ConfigMapSecretDataProps extends Pick<ConfigMapSecretFormProps, 'useFormProps'> {
    isESO: boolean
    isHashiOrAWS: boolean
    isUnAuthorized: boolean
    readOnly: boolean
    isPatchMode: boolean
}

export interface ConfigMapSecretReadyOnlyProps
    extends Pick<
        ConfigMapSecretFormProps,
        'configMapSecretData' | 'componentType' | 'cmSecretStateLabel' | 'isJob' | 'areScopeVariablesResolving'
    > {
    hideCodeEditor?: boolean
}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal'

export interface ConfigMapSecretDeleteModalProps
    extends Pick<ConfigMapSecretFormProps, 'componentType' | 'cmSecretStateLabel'> {
    appId: number
    envId: number
    id: number
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
        | 'disableDataTypeChange'
        | 'id'
        | 'onError'
        | 'onSubmit'
        | 'areScopeVariablesResolving'
        | 'appChartRef'
        | 'useFormProps'
    > &
    Pick<ConfigMapSecretDeleteModalProps, 'updateCMSecret'> & {
        componentName: string
        publishedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        inheritedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        draftData: CMSecretDraftData
        selectedProtectionViewTab: ProtectConfigTabsType
    } & {
        shouldMergeTemplateWithPatches: boolean
    }

export type ConfigMapSecretDryRunProps = Pick<
    ConfigMapSecretFormProps,
    | 'cmSecretStateLabel'
    | 'componentType'
    | 'isApprovalPolicyConfigured'
    | 'isSubmitting'
    | 'onSubmit'
    | 'isJob'
    | 'areScopeVariablesResolving'
> &
    Pick<ConfigToolbarProps, 'resolveScopedVariables' | 'handleToggleScopedVariablesView'> &
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
        formData: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>['data']
        isFormDirty: boolean
        dryRunEditorMode: DryRunEditorMode
        handleChangeDryRunEditorMode: (mode: DryRunEditorMode) => void
        showCrudButtons: boolean
    }

// DTO
export interface ConfigMapSecretManifestDTO {
    manifest: string
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

export interface ConfigMapSecretManifestProps {
    appId: number
    mergeStrategy: OverrideMergeStrategyType
    resourceType: CMSecretComponentType
    resourceName: string
    environmentId: number
    values: Record<string, any>
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
    headerTab: ConfigHeaderTabType
}
