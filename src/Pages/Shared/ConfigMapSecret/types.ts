import { Dispatch, SetStateAction } from 'react'

import {
    SelectPickerOptionType,
    useForm,
    UseFormErrorHandler,
    UseFormSubmitHandler,
} from '@devtron-labs/devtron-fe-common-lib'

import { NoOverrideEmptyStateProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'

import { ComponentStates, EnvironmentOverrideComponentProps } from '../EnvironmentOverride/EnvironmentOverrides.types'
import { CMSecretConfigData } from '../ConfigMapSecretOld/ConfigMapSecret.types'

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

export interface ConfigMapSecretFormProps {
    id: number
    configMapSecretData: CMSecretConfigData
    cmSecretStateLabel: CM_SECRET_STATE
    isJob?: boolean
    componentType: CMSecretComponentType
    draftMode: boolean
    isAppAdmin?: boolean
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

export interface ConfigMapSecretInheritedProps
    extends Pick<ConfigMapSecretFormProps, 'configMapSecretData' | 'componentType'> {}

export interface ConfigMapSecretDeleteModalProps
    extends Pick<ConfigMapSecretFormProps, 'componentType' | 'configMapSecretData' | 'id'> {
    appId: number
    envId: number
    updateCMSecret: (name?: string) => void
    closeDeleteModal: () => void
}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal'

export type ConfigMapSecretOverrideEmptyStateProps = Pick<ConfigMapSecretFormProps, 'componentType'> &
    Pick<NoOverrideEmptyStateProps, 'handleViewInheritedConfig'> & {
        envName: string
        configName: string
        renderFormComponent: (props: Pick<ConfigMapSecretFormProps, 'onCancel'>) => JSX.Element
    }
