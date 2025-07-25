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
    AppConfigProps,
    CIBuildConfigType,
    CIBuildType,
    CiPipeline,
    CommonNodeAttr,
    DockerConfigOverrideType,
    KeyValueTableData,
    Material,
    OptionType,
    SelectPickerOptionType,
    ServerError,
    VariableType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'
import { OptionTypeWithIcon } from '@Components/externalLinks/ExternalLinks.type'

import { ComponentStates } from '../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { ConfigOverrideWorkflowDetails } from '../../services/service.types'
import { CiPipelineResult } from '../app/details/triggerView/types'
import { CIPipelineDataType } from '../ciPipeline/types'

export interface ArgsFieldSetProps {
    args: { key: string; value: string }[]
    addMoreArgs: () => void
    removeArgs: (index: number) => void
    saveArgs: (event: React.ChangeEvent, key: string, index: number) => void
}

export interface DockerRegistry {
    id: string
    registryUrl: string
    isDefault: boolean
}

export interface CIConfigState {
    registryOptions: Array<DockerRegistry>

    buttonLabel: string
    code: number
    errors: ServerError[]
    successMessage: string | null

    view: string
    configStatus: number
    sourceConfigData: {
        appName: string
        material: { id: number; name: string; checkoutPath: string }[]
    }
    form: {
        id: number
        appId: number | null
        checkoutPath: string
        dockerFilePath: string
        args: Array<{ key: string; value: string }>
        dockerRegistry: string
        dockerRepository: string
        dockerfile: string
    }
    version: string
    isUnsaved: boolean
    showDialog: boolean
}

export interface ProcessedWorkflowsType {
    workflows: WorkflowType[]
}

export interface CIConfigParentState {
    loadingState: ComponentStates
    selectedCIPipeline: CIPipelineDataType
    dockerRegistries: any
    sourceConfig: any
    ciConfig: CiPipelineResult
    defaultDockerConfigs: DockerConfigOverrideType
    currentCIBuildType?: CIBuildType
}

export interface LoadingState {
    loading: boolean
    failed: boolean
}

export interface CIConfigProps
    extends Pick<CIContainerRegistryConfigProps, 'isCreateAppView'>,
        Required<Pick<AppConfigProps, 'isTemplateView'>> {
    respondOnSuccess: (redirection?: boolean) => void
    configOverrideView?: boolean
    allowOverride?: boolean
    parentState?: CIConfigParentState
    setParentState?: (parentState: CIConfigParentState) => void
    updateDockerConfigOverride?: (key: string, value) => void
    isCDPipeline?: boolean
    isCiPipeline?: boolean
    loadingStateFromParent?: LoadingState
    setLoadingStateFromParent?: React.Dispatch<React.SetStateAction<LoadingState>>
    appId: string
}

export interface CIConfigDiffViewProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    parentReloading: boolean
    ciConfig: CiPipelineResult
    configOverridenPipelines: CiPipeline[]
    toggleConfigOverrideDiffModal: () => void
    reload: (skipPageReload?: boolean) => Promise<void>
    gitMaterials: any
}

export interface CurrentMaterialType {
    gitProviderId: number
    url: string
    checkoutPath: string
    active: boolean
    fetchSubmodules: boolean
    includeExcludeFilePath: string
    isExcludeRepoChecked: boolean
    name?: string
    id?: number
}

export interface SelectedGitMaterialType extends CurrentMaterialType, OptionTypeWithIcon {}

export interface SourceConfigType {
    appName: string
    appType: number
    description: string
    teamId: number
    templateId: number
    material: SelectedGitMaterialType[]
}
export interface CIConfigFormProps
    extends Required<Pick<CIConfigProps, 'isCreateAppView' | 'parentState' | 'setParentState'>>,
        Pick<CIConfigProps, 'isTemplateView'> {
    parentReloading: boolean
    dockerRegistries: any
    sourceConfig: SourceConfigType
    ciConfig: CiPipelineResult
    reload: (skipPageReload?: boolean, redirection?: boolean) => Promise<void>
    appId: string
    selectedCIPipeline: CIPipelineDataType
    configOverrideView: boolean
    allowOverride: boolean
    updateDockerConfigOverride: (key: string, value: CIBuildConfigType | boolean | string) => void
    isCDPipeline: boolean
    isCiPipeline: boolean
    parentState: CIConfigParentState
    loadingStateFromParent?: LoadingState
    setLoadingStateFromParent?: React.Dispatch<React.SetStateAction<LoadingState>>
}

export interface AdvancedConfigOptionsProps
    extends Pick<CIConfigProps, 'appId'>,
        Required<Pick<AppConfigProps, 'isTemplateView'>> {
    ciPipeline: CIPipelineDataType
}

interface LanguageBuilderType {
    Language: string
    LanguageIcon: string
    Versions: string[]
    BuilderLanguageMetadata: {
        Id: string
        BuilderLangEnvParam: string
    }[]
}

interface LanguageFrameworkType {
    Language: string
    LanguageIcon: string
    Framework: string
    TemplateUrl: string
}

export interface BuilderIdOptionType extends OptionType {
    BuilderLangEnvParam: string
}

export interface VersionsOptionType extends OptionTypeWithIcon {
    infoText?: string
    value: string
}

export interface LanguageOptionType extends SelectPickerOptionType {
    value: string
    icon: string
}

export interface BuildersAndFrameworksType {
    builders: LanguageBuilderType[]
    frameworks: LanguageFrameworkType[]
    selectedBuilder: BuilderIdOptionType
    selectedLanguage: LanguageOptionType
    selectedVersion: VersionsOptionType
}

export interface LanguageBuilderOptionType {
    LanguageIcon: string
    Versions: VersionsOptionType[]
    BuilderLanguageMetadata: BuilderIdOptionType[]
}

export interface InitLanguageOptionType {
    language: string
    icon: string
    version: string
    builderId: string
    BuilderLangEnvParam: string
}

export interface CIConfigDiffType {
    configName: string
    changeBGColor: boolean
    baseValue: string
    overridenValue: string
    showInEditor?: boolean
}

export interface CIFormStateOptionType {
    value: any
    error: string
}
export interface CIContainerRegistryConfigProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    appId: string
    configOverrideView: boolean
    ciConfig: CiPipelineResult
    allowOverride: boolean
    configOverridenPipelines: CiPipeline[]
    toggleConfigOverrideDiffModal: () => void
    updateDockerConfigOverride: (key: string, value: CIBuildConfigType | boolean | string) => void
    dockerRegistries: any
    registry: CIFormStateOptionType
    repository_name: CIFormStateOptionType
    currentRegistry: any
    handleOnChangeConfig: (e) => void
    isCDPipeline: boolean
    isCreateAppView?: boolean
}

export interface CIBuildArgType extends KeyValueTableData {}

export interface FrameworkOptionType extends OptionType {
    templateUrl: string
}

export interface TemplateDataType {
    fetching: boolean
    data: string
}

export interface CIDockerFileConfigProps {
    configOverrideView: boolean
    ciConfig: CiPipelineResult
    sourceConfig: SourceConfigType
    allowOverride: boolean
    selectedCIPipeline: CIPipelineDataType
    currentMaterial: any
    currentBuildContextGitMaterial: any
    selectedMaterial: any
    setSelectedMaterial: React.Dispatch<React.SetStateAction<any>>
    selectedBuildContextGitMaterial: any
    setSelectedBuildContextGitMaterial: React.Dispatch<React.SetStateAction<any>>
    formState: any
    updateDockerConfigOverride: (key: string, value: CIBuildConfigType | boolean | string) => void
    args: CIBuildArgType[]
    setArgs: React.Dispatch<React.SetStateAction<CIBuildArgType[]>>
    buildEnvArgs: CIBuildArgType[]
    setBuildEnvArgs: React.Dispatch<React.SetStateAction<CIBuildArgType[]>>
    setArgsError: React.Dispatch<React.SetStateAction<{ args: boolean; buildEnvArgs: boolean }>>
    handleOnChangeConfig: (e) => void
    selectedTargetPlatforms: any
    setSelectedTargetPlatforms: any
    targetPlatformMap: any
    showCustomPlatformWarning: any
    setShowCustomPlatformWarning: any
    currentCIBuildConfig: CIBuildConfigType
    setCurrentCIBuildConfig: React.Dispatch<React.SetStateAction<CIBuildConfigType>>
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>
}

export interface CICreateDockerfileOptionProps {
    configOverrideView: boolean
    allowOverride: boolean
    frameworks: LanguageFrameworkType[]
    sourceConfig: any
    currentCIBuildConfig: CIBuildConfigType
    currentMaterial: any
    selectedMaterial: any
    handleFileLocationChange: (selectedMaterial) => void
    repository?: CIFormStateOptionType
    setCurrentCIBuildConfig: React.Dispatch<React.SetStateAction<CIBuildConfigType>>
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>
    currentBuildContextGitMaterial: any
    selectedBuildContextGitMaterial: any
    formState: any
    ciConfig: CiPipelineResult
    handleOnChangeConfig: (e) => void
    isDefaultBuildContext: () => boolean
    setSelectedBuildContextGitMaterial: React.Dispatch<React.SetStateAction<any>>
}

export interface CIBuildpackBuildOptionsProps {
    ciBuildConfig: CIBuildConfigType
    sourceConfig: any
    buildersAndFrameworks: BuildersAndFrameworksType
    setBuildersAndFrameworks: React.Dispatch<React.SetStateAction<BuildersAndFrameworksType>>
    configOverrideView: boolean
    currentMaterial: any
    selectedMaterial: any
    handleFileLocationChange: (selectedMaterial) => void
    repository: CIFormStateOptionType
    projectPath: CIFormStateOptionType
    handleOnChangeConfig: (e) => void
    currentCIBuildConfig: CIBuildConfigType
    setCurrentCIBuildConfig: React.Dispatch<React.SetStateAction<CIBuildConfigType>>
    buildEnvArgs: CIBuildArgType[]
    setBuildEnvArgs: React.Dispatch<React.SetStateAction<CIBuildArgType[]>>
    readOnly?: boolean
}

export interface CIAdvancedConfigProps extends Pick<CIDockerFileConfigProps, 'args' | 'setArgs' | 'setArgsError'> {
    configOverrideView: boolean
    allowOverride: boolean
    isBuildpackType: boolean
    selectedTargetPlatforms: any
    setSelectedTargetPlatforms: any
    targetPlatformMap: any
    showCustomPlatformWarning: any
    setShowCustomPlatformWarning: any
}

export interface CIBuildConfigDiffProps {
    configOverridenWorkflows: ConfigOverrideWorkflowDetails[]
    wfId: string
    configOverridenPipelines: CiPipeline[]
    materials: Material[]
    globalCIConfig: DockerConfigOverrideType
    gitMaterials: any
}

export interface TargetPlatformSelectorType {
    allowOverride?: boolean
    selectedTargetPlatforms: OptionType[]
    setSelectedTargetPlatforms: React.Dispatch<React.SetStateAction<OptionType[]>>
    showCustomPlatformWarning: boolean
    setShowCustomPlatformWarning: (value: boolean) => void
    targetPlatformMap: Map<string, boolean>
    targetPlatform?: string
    configOverrideView?: boolean
    updateDockerConfigOverride?: (key: string, value: CIBuildConfigType | OptionType[] | boolean | string) => void
}

export interface CIPipelineSidebarType {
    isJobView?: boolean
    isJobCI?: boolean
    setInputVariablesListFromPrevStep: React.Dispatch<
        React.SetStateAction<{
            preBuildStage: Map<string, VariableType>[]
            postBuildStage: Map<string, VariableType>[]
        }>
    >
    environments?: EnvironmentWithSelectPickerType[]
    selectedEnv?: EnvironmentWithSelectPickerType
    setSelectedEnv?: React.Dispatch<React.SetStateAction<EnvironmentWithSelectPickerType>>
}

export interface TaskListType {
    withWarning: boolean
    setInputVariablesListFromPrevStep: React.Dispatch<
        React.SetStateAction<{
            preBuildStage: Map<string, VariableType>[]
            postBuildStage: Map<string, VariableType>[]
        }>
    >
    isJobView: boolean
}

export interface BuildContextProps {
    isDefaultBuildContext: boolean
    sourceConfig: SourceConfigType
    selectedBuildContextGitMaterial: any
    currentMaterial: any
    setSelectedBuildContextGitMaterial: React.Dispatch<React.SetStateAction<any>>
    handleOnChangeConfig: (e) => void
    buildContextValue: string
    currentCIBuildConfig: CIBuildConfigType
    formState: any
    setCurrentCIBuildConfig: React.Dispatch<React.SetStateAction<CIBuildConfigType>>
    currentBuildContextGitMaterial: any
    readOnly?: boolean
    configOverrideView?: boolean
    repositoryError?: string
    readOnlyBuildContextPath?: string
}

export interface CISelfDockerBuildOptionProps {
    currentMaterial: any
    sourceMaterials: any
    readonlyDockerfileRelativePath: string
    selectedMaterial: any
    dockerFileValue: string
    handleFileLocationChange: (selectedMaterial) => void
    handleOnChangeConfig: (e) => void
    readOnly?: boolean
    configOverrideView?: boolean
    repositoryError?: string
    dockerfileError?: string
}

export interface CIBuildTypeOptionType {
    id: CIBuildType
    heading: string
    info: string
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    noIconFill: boolean
    iconStroke: boolean
    addDivider: boolean
}

export interface MaterialOptionType extends SelectPickerOptionType {
    checkoutPath: string
    fetchSubmodules: boolean
    filterPattern: string
    id: number
    isUsedInCiConfig: boolean
    name: string
    url: string
}

export interface CreateDockerFileLanguageOptionsProps {
    editorData: TemplateDataType
    editorValue: string
    handleGitRepoChange: (selectedMaterial) => void
    materialOptions: MaterialOptionType[]
    selectedMaterial: MaterialOptionType
    languageFrameworks: Map<string, FrameworkOptionType[]>
    selectedLanguage: LanguageOptionType
    resetChanges: () => void
    currentMaterial: any
    languages: LanguageOptionType[]
    selectedFramework: FrameworkOptionType
    handleLanguageSelection: (selected: LanguageOptionType) => void
    handleFrameworkSelection: (selected: FrameworkOptionType) => void
    readOnly?: boolean
}

export interface ResetEditorChangesProps {
    resetChanges: () => void
    editorData: TemplateDataType
    editorValue: string
}

export interface GetCIPipelineModalURLType {
    ciNode: CommonNodeAttr
    workflowId: number
}

export interface CIContainerRegistryInfoBlockProps {
    configOverriddenPipelines: CiPipeline[]
    toggleConfigOverrideDiffModal: () => void
    isCDPipeline: boolean
    isTemplateView: boolean
    appId: string
    onClickRedirectLink: (e) => void
}
