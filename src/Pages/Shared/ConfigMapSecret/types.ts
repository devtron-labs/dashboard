import { Dispatch, SetStateAction } from 'react'

import {
    ConfigDatum,
    DraftAction,
    DraftMetadataDTO,
    ProtectConfigTabsType,
    SelectPickerOptionType,
    useForm,
    UseFormErrorHandler,
    UseFormSubmitHandler,
} from '@devtron-labs/devtron-fe-common-lib'

import { NoOverrideEmptyStateProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'

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

export enum CMSecretExternalType {
    Internal = '',
    KubernetesConfigMap = 'KubernetesConfigMap',
    KubernetesSecret = 'KubernetesSecret',
    AWSSecretsManager = 'AWSSecretsManager',
    AWSSystemManager = 'AWSSystemManager',
    HashiCorpVault = 'HashiCorpVault',
    ESO_GoogleSecretsManager = 'ESO_GoogleSecretsManager',
    ESO_AWSSecretsManager = 'ESO_AWSSecretsManager',
    ESO_AzureSecretsManager = 'ESO_AzureSecretsManager',
    ESO_HashiCorpVault = 'ESO_HashiCorpVault',
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
    | 'secretData'
    | 'esoSecretData'
    | 'filePermission'
>

export interface CMSecretDraftPayloadType {
    id: number
    appId: number
    configData: [CMSecretPayloadType]
    environmentId: number
}

// SELECT PICKER OPTION TYPE
export type ConfigMapSecretDataTypeOptionType = SelectPickerOptionType<string>

// USE FORM PROPS
export interface CMSecretYamlData {
    k: string
    v: string
    keyError: string
    valueError: string
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
    isOverrideView?: boolean
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

export interface ConfigMapSecretFormProps {
    id: number
    configMapSecretData: CMSecretConfigData
    cmSecretStateLabel: CM_SECRET_STATE
    isJob?: boolean
    componentType: CMSecretComponentType
    isProtected: boolean
    isSubmitting: boolean
    onSubmit: UseFormSubmitHandler<ConfigMapSecretUseFormProps>
    onError: UseFormErrorHandler<ConfigMapSecretUseFormProps>
    onCancel: () => void
}

export interface ConfigMapSecretDataProps extends Pick<ConfigMapSecretFormProps, 'isJob' | 'componentType'> {
    isESO: boolean
    isHashiOrAWS: boolean
    isUnAuthorized: boolean
    useFormProps: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>
}

export interface ConfigMapSecretReadyOnlyProps
    extends Pick<ConfigMapSecretFormProps, 'configMapSecretData' | 'componentType'> {}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal'

export interface ConfigMapSecretDeleteModalProps extends Pick<ConfigMapSecretFormProps, 'componentType' | 'id'> {
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
          envName?: never
          configName?: never
          componentName: string
          componentType?: never
          nullStateType: 'DELETE'
          handleViewInheritedConfig?: never
          hideOverrideButton?: never
          renderFormComponent?: never
      }
    | {
          envName?: never
          configName?: never
          componentName?: never
          componentType?: never
          nullStateType: 'DELETE_OVERRIDE' | 'NOT_OVERRIDDEN'
          handleViewInheritedConfig?: never
          hideOverrideButton?: never
          renderFormComponent?: never
      }
    | ({
          envName: string
          configName: string
          componentType: ConfigMapSecretFormProps['componentType']
          componentName?: never
          nullStateType: 'NO_OVERRIDE'
          renderFormComponent: (props: Pick<ConfigMapSecretFormProps, 'onCancel'>) => JSX.Element
      } & Pick<NoOverrideEmptyStateProps, 'handleViewInheritedConfig' | 'hideOverrideButton'>)
    | {
          envName?: never
          configName?: never
          componentType: ConfigMapSecretFormProps['componentType']
          componentName?: never
          nullStateType: 'NO_CM_CS'
          handleViewInheritedConfig?: never
          hideOverrideButton?: never
          renderFormComponent?: never
      }

export type ConfigMapSecretProtectedProps = Pick<
    ConfigMapSecretContainerProps,
    'componentType' | 'parentName' | 'isJob' | 'appName' | 'envName'
> &
    Pick<ConfigMapSecretFormProps, 'cmSecretStateLabel' | 'id' | 'onError' | 'onSubmit'> & {
        componentName: string
        publishedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        updateCMSecret: (configName?: string) => void
        inheritedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        draftData: CMSecretDraftData
        selectedProtectionViewTab: ProtectConfigTabsType
    }

// DTO
export interface CMSecretDTO {
    id: number
    appId: number
    configData: ConfigDatum[]
}
