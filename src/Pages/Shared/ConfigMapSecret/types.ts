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
    AppConfigProps,
    AppEnvDeploymentConfigDTO,
    CM_SECRET_STATE,
    CMSecretComponentType,
    CMSecretConfigData,
    CMSecretPayloadType,
    ConfigHeaderTabType,
    ConfigMapSecretDataType,
    ConfigMapSecretUseFormProps,
    DraftAction,
    DraftMetadataDTO,
    DryRunEditorMode,
    OverrideMergeStrategyType,
    ProtectConfigTabsType,
    useForm,
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
    extends Pick<ConfigMapSecretContainerProps, 'appName' | 'envName' | 'componentType'>,
        Required<Pick<AppConfigProps, 'isTemplateView'>> {
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
    isExceptionUser: boolean
    isTemplateView: AppConfigProps['isTemplateView']
}

export interface ConfigMapSecretContainerProps extends Omit<CMSecretWrapperProps, 'parentState' | 'setParentState'> {
    appChartRef: { id: number; version: string; name: string }
}

type CMCSFormBaseProps =
    | {
          isExternalSubmit: true
          onSubmit?: never
          onCancel?: never
      }
    | {
          isExternalSubmit?: never
          onSubmit: () => void
          onCancel: () => void
      }

export type ConfigMapSecretFormProps = Required<
    Pick<ConfigMapSecretContainerProps, 'isApprovalPolicyConfigured' | 'componentType' | 'appChartRef'>
> &
    CMCSFormBaseProps & {
        /**
         * @default false
         */
        isCreateView?: boolean
        configMapSecretData: CMSecretConfigData
        inheritedConfigMapSecretData: CMSecretConfigData
        publishedConfigMapSecretData: CMSecretConfigData
        draftData: CMSecretDraftData
        cmSecretStateLabel: CM_SECRET_STATE
        isSubmitting?: boolean
        areScopeVariablesResolving: boolean
        isDraft?: boolean
        disableDataTypeChange: boolean
        useFormProps: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>
        /**
         * @default false
         */
        noContainerPadding?: boolean
        /**
         * This is also being used in BuildInfra
         */
        isJob?: boolean
        /** Whether the express edit view is visible. */
        isExpressEditView: boolean
        /** Whether the express edit comparison view is visible. */
        isExpressEditComparisonView: boolean
        /** Handler for changing merge strategy. */
        handleMergeStrategyChange: (strategy: OverrideMergeStrategyType) => void
    }

export interface ConfigMapSecretDataProps
    extends Pick<
        ConfigMapSecretFormProps,
        | 'useFormProps'
        | 'isExpressEditView'
        | 'isExpressEditComparisonView'
        | 'draftData'
        | 'publishedConfigMapSecretData'
        | 'handleMergeStrategyChange'
    > {
    isESO: boolean
    isHashiOrAWS: boolean
    isUnAuthorized: boolean
    readOnly: boolean
    isPatchMode: boolean
    hasPublishedConfig: boolean
}

export type CMSecretDeleteModalType = 'deleteModal' | 'protectedDeleteModal' | 'expressDeleteDraft'

export interface ConfigMapSecretDeleteModalProps
    extends Pick<ConfigMapSecretFormProps, 'componentType' | 'cmSecretStateLabel'>,
        Pick<ConfigMapSecretContainerProps, 'isTemplateView' | 'isExceptionUser'> {
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
        | 'onSubmit'
        | 'onCancel'
        | 'areScopeVariablesResolving'
        | 'appChartRef'
        | 'useFormProps'
        | 'isExpressEditView'
        | 'isExpressEditComparisonView'
        | 'handleMergeStrategyChange'
    > &
    Pick<ConfigMapSecretDeleteModalProps, 'updateCMSecret'> & {
        id: number
        componentName: string
        publishedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        inheritedConfigMapSecretData: ConfigMapSecretFormProps['configMapSecretData']
        draftData: CMSecretDraftData
        selectedProtectionViewTab: ProtectConfigTabsType
    } & {
        shouldMergeTemplateWithPatches: boolean
        handleNoPublishedStateRedirectClick: () => void
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
    extends Pick<ConfigMapSecretCommonAPIProps, 'appId' | 'id' | 'payload' | 'signal'> {
    isTemplateView: AppConfigProps['isTemplateView']
    isExpressEdit: boolean
}

export interface DeleteConfigMapSecretProps
    extends Pick<ConfigMapSecretCommonAPIProps, 'id' | 'appId' | 'name'>,
        Pick<UpdateConfigMapSecretProps, 'isTemplateView' | 'isExpressEdit'> {}

export interface DeleteEnvConfigMapSecretProps
    extends DeleteConfigMapSecretProps,
        Pick<ConfigMapSecretCommonAPIProps, 'envId'> {}

export interface OverrideConfigMapSecretProps
    extends Pick<ConfigMapSecretCommonAPIProps, 'appId' | 'envId' | 'payload' | 'signal'>,
        Pick<UpdateConfigMapSecretProps, 'isTemplateView' | 'isExpressEdit'> {}

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
