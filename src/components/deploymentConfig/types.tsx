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

import React from 'react'
import {
    ResponseType,
    ServerError,
    AppEnvironment,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    ChartMetadataType,
    ConfigKeysWithLockType,
} from '@devtron-labs/devtron-fe-common-lib'
import * as jsonpatch from 'fast-json-patch'
import { EnvironmentOverrideComponentProps } from '../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'

export interface DeploymentConfigState {
    code: number
    errors: ServerError[]
    successMessage: string | null
    configStatus: number
    view: string
    chartReferences: { id: number; version: string }[]
    template: {
        latestAppConfig: DeploymentConfigTemplate & { jsonSubsetStr: string; yamlSubset: any }
        previousAppConfig: DeploymentConfigTemplate
    }
    configMap: ConfigMap
    latestChartRef: number
    isUnsaved: boolean
    showDialog: boolean
}

export interface DeploymentConfigTemplate {
    id: number
    appId: number | null
    refChartTemplate: string
    refChartTemplateVersion: string
    chartRefId: number
    valuesOverride: any
    latest: boolean
    defaultAppOverride: any
    isAppMetricsEnabled?: boolean
}

export interface ConfigMap {
    id: number
    appId: number | null
    environmentId: number
    pipelineId: number
    configMapValuesOverride: any
    secretsValuesOverride: any
    configMapJsonStr: string
    secretsJsonStr: string
    configMapYaml: string
    secretsYaml: string
}

export interface ConfigMapRequest {
    id: number
    app_id: number
    environment_id: number
    pipeline_id: number
    config_map_data: any
    secret_data: any
}

export interface DeploymentConfigProps
    extends Omit<EnvironmentOverrideComponentProps, 'envConfig' | 'fetchEnvConfig' | 'onErrorRedirectURL'> {
    respondOnSuccess?: (redirection: boolean) => void
    isUnSet: boolean
    isCiPipeline: boolean
    environments: AppEnvironment[]
    isProtected: boolean
    reloadEnvironments: () => void
}

interface DeploymentTemplateGlobalConfigDTO {
    appId: number
    chartRefId: number
    // TODO: Look into this, why it is there
    chartRepositoryId: number
    // TODO: Look into this, why it is there
    currentViewEditor: string
    /**
     * Base deployment template
     */
    defaultAppOverride: Record<string, string>
    id: number
    isAppMetricsEnabled: boolean
    isBasicViewLocked: boolean
    latest: boolean
    readme: string
    refChartTemplate: string
    refChartTemplateVersion: string
    /**
     * Might be irrelevant
     */
    saveEligibleChanges: boolean
    /**
     * Schema to feed into the Code editor
     */
    schema: Record<string, string>
}

export interface DeploymentTemplateConfigDTO {
    globalConfig: DeploymentTemplateGlobalConfigDTO
    guiSchema: string
}

export interface MinChartRefDTO {
    chartMetadata: Record<string, ChartMetadataType>
    chartRefs: DeploymentChartVersionType[]
    latestAppChartRef: number
    latestChartRef: number
    latestEnvChartRef?: number
}

export interface DeploymentChartGroupOptionType {
    label: string
    options: DeploymentChartOptionType[]
}

export interface DeploymentConfigFormCTAProps {
    loading: boolean
    showAppMetricsToggle: boolean
    isAppMetricsEnabled: boolean
    handleSaveChanges: React.MouseEventHandler<HTMLButtonElement>
    isEnvOverride?: boolean
    isCiPipeline?: boolean
    disableCheckbox?: boolean
    disableButton?: boolean
    toggleAppMetrics: () => void
    isPublishedMode: boolean
    reload: () => void
    isValues?: boolean
    convertVariables?: boolean
    handleLockedDiffDrawer: (value: boolean) => void
    showLockedDiffForApproval: boolean
    setShowLockedDiffForApproval: (show: boolean) => void
    checkForProtectedLockedChanges: () => Promise<ResponseType>
}

export interface CompareWithDropdownProps {
    envId: string
    isEnvOverride: boolean
    environments: DeploymentChartOptionType[]
    charts: DeploymentChartOptionType[]
    globalChartRef?: any
    selectedOption: DeploymentChartOptionType
    setSelectedOption: any
    isValues: boolean
    groupedData: any
    setConvertVariables: (convertVariables: boolean) => void
    triggerEditorLoadingState: () => void
}

export interface CompareWithApprovalPendingAndDraftProps {
    isEnvOverride: boolean
    overridden: boolean
    readOnly: boolean
    environmentName: string
    selectedChart: DeploymentChartVersionType
    handleOverride: (e: any) => Promise<void>
    latestDraft: any
    isPublishedOverriden: boolean
    isDeleteDraftState: boolean
    setShowDraftData: (show: boolean) => void
    isValues: boolean
    selectedOptionDraft: any
    setSelectedOptionDraft: any
}

export interface CompareApprovalAndDraftSelectedOption {
    id: number
    label: string
}

export interface ChartTypeVersionOptionsProps {
    isUnSet: boolean
    disableVersionSelect?: boolean
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChart: DeploymentChartVersionType
    selectChart: (selectedChart: DeploymentChartVersionType) => void
    selectedChartRefId: number
}

export interface CompareOptionsProps {
    isComparisonAvailable: boolean
    isEnvOverride: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    chartConfigLoading: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
}

export interface DeploymentTemplateOptionsTabProps {
    openComparison: boolean
    chartConfigLoading: boolean
    openReadMe: boolean
    isUnSet: boolean
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
    disableVersionSelect?: boolean
    yamlMode: boolean
    codeEditorValue: string
    changeEditorMode?: () => void
}

// TODO: the following types can be combined with this into a single type
export interface DeploymentTemplateReadOnlyEditorViewProps {
    value: string
    isEnvOverride?: boolean
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    hideLockedKeys: boolean
    uneditedDocument: string
    editedDocument: string
}

export interface DeploymentTemplateEditorViewProps {
    isEnvOverride?: boolean
    environmentName?: string
    value: string
    defaultValue?: string
    editorOnChange?: (str: string) => void
    readOnly?: boolean
    globalChartRefId?: number
    handleOverride?: (e: any) => Promise<void>
    isValues?: boolean
    convertVariables?: boolean
    setConvertVariables?: (convertVariables: boolean) => void
    groupedData?: any
    hideLockedKeys: boolean
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    hideLockKeysToggled: React.MutableRefObject<boolean>
    removedPatches: React.MutableRefObject<jsonpatch.Operation[]>
    uneditedDocument: DeploymentTemplateReadOnlyEditorViewProps['uneditedDocument']
    editedDocument: DeploymentTemplateReadOnlyEditorViewProps['editedDocument']
}

export interface EsoData {
    secretKey: string
    key: string
    property?: string
}

export interface SecretData {
    key: string
    name: string
    property: string
    isBinary: boolean
}

export interface EsoSecretData {
    secretStore: any
    secretStoreRef: any
    esoData: EsoData[]
    refreshInterval: string
}
export interface SecretFormProps {
    id: number
    appChartRef: { id: number; version: string; name: string }
    appId: number
    roleARN: string
    name: string
    index: number
    external: boolean
    externalType: string
    secretData: SecretData[]
    esoSecretData?: EsoSecretData
    type: string
    data: { k: string; v: string }[]
    isUpdate: boolean
    mountPath: string
    keyValueEditable?: boolean
    filePermission: string
    subPath: boolean
    update: (...args) => void
    collapse: (...args) => void
    initialise?: () => void
    isJobView?: boolean
}

interface ErrorObj {
    isValid: boolean
    message: string | null
}

export interface ChartSelectorModalType {
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    isUnSet: boolean
}

export interface DeploymentConfigToolbarProps {
    selectedTabIndex: number
    handleTabSelection: (index: number) => void
    noReadme?: boolean
    showReadme: boolean
    handleReadMeClick: () => void
    convertVariables?: boolean
    setConvertVariables?: (convertVariables: boolean) => void
    unableToParseYaml: boolean
}

export interface DropdownContainerProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export interface DropdownItemProps {
    label: string
    isValues: boolean
    index: number
    onClick: () => void
}

export interface SaveConfirmationDialogProps {
    onSave: () => void
    showAsModal: boolean
    closeLockedDiffDrawerWithChildModal: () => void
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
        DeploymentTemplateEditorViewProps,
        'editorOnChange' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys'
    > {
    value: string
    readOnly: boolean
    uneditedDocument?: DeploymentTemplateEditorViewProps['uneditedDocument']
    editedDocument?: DeploymentTemplateEditorViewProps['editedDocument']

    isUnSet: boolean
    handleEnableWasGuiOrHideLockedKeysEdited: () => void
    wasGuiOrHideLockedKeysEdited: boolean
    handleChangeToYAMLMode: () => void
    /**
     * @default - false
     */
    isLoading?: boolean
    guiSchema: string
    selectedChart: DeploymentChartVersionType
    rootClassName?: string
}

export interface Schema {
    type: string
    items: Schema
    properties: Schema
}
