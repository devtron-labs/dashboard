import React from 'react'
import { ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigOverrideWorkflowDetails } from '../../services/service.types'
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'
import { CiPipeline, CiPipelineResult, Material, WorkflowType } from '../app/details/triggerView/types'
import { OptionType } from '../app/types'
import {
    CIBuildConfigType,
    CIBuildType,
    CIPipelineDataType,
    DockerConfigOverrideType,
    FormType,
} from '../ciPipeline/types'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'

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
    processing: boolean
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

export interface CIConfigProps {
    respondOnSuccess: () => void
    configOverrideView?: boolean
    allowOverride?: boolean
    parentState?: CIConfigParentState
    setParentState?: React.Dispatch<React.SetStateAction<CIConfigParentState>>
    updateDockerConfigOverride?: (key, value) => void
    isCDPipeline?: boolean
    isCiPipeline?: boolean
    navItems?: CustomNavItemsType[]
    setLoadingData?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface CIConfigDiffViewProps {
    parentReloading: boolean
    ciConfig: CiPipelineResult
    configOverridenPipelines: CiPipeline[]
    configOverrideWorkflows: ConfigOverrideWorkflowDetails[]
    processedWorkflows: ProcessedWorkflowsType
    toggleConfigOverrideDiffModal: () => void
    reload: (skipPageReload?: boolean) => Promise<void>
    gitMaterials: any
}

export interface CIConfigFormProps {
    parentReloading: boolean
    dockerRegistries: any
    sourceConfig: any
    ciConfig: CiPipelineResult
    reload: (skipPageReload?: boolean) => Promise<void>
    appId: string
    selectedCIPipeline: CIPipelineDataType
    configOverrideWorkflows: ConfigOverrideWorkflowDetails[]
    configOverrideView: boolean
    allowOverride: boolean
    updateDockerConfigOverride: (key: string, value: CIBuildConfigType | boolean | string) => void
    isCDPipeline: boolean
    isCiPipeline: boolean
    navItems: CustomNavItemsType[]
    parentState: CIConfigParentState
    setParentState: React.Dispatch<React.SetStateAction<CIConfigParentState>>
    setLoadingData?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface AdvancedConfigOptionsProps {
    ciPipeline: CIPipelineDataType
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    setDockerConfigOverridden: React.Dispatch<React.SetStateAction<boolean>>
    setLoadingData: React.Dispatch<React.SetStateAction<boolean>>
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

export interface VersionsOptionType extends OptionType {
    infoText?: string
}

export interface LanguageOptionType extends OptionType {
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
export interface CIContainerRegistryConfigProps {
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
}

export interface CIBuildArgType {
    k: string
    v: string
    keyError: string
    valueError: string
}

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
    sourceConfig: any
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
    handleOnChangeConfig: (e) => void
    selectedTargetPlatforms: any
    setSelectedTargetPlatforms: any
    targetPlatformMap: any
    showCustomPlatformWarning: any
    setShowCustomPlatformWarning: any
    currentCIBuildConfig: CIBuildConfigType
    setCurrentCIBuildConfig: React.Dispatch<React.SetStateAction<CIBuildConfigType>>
    setInProgress: React.Dispatch<React.SetStateAction<boolean>>
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
    setInProgress: React.Dispatch<React.SetStateAction<boolean>>
    currentBuildContextGitMaterial: any
    selectedBuildContextGitMaterial: any
    handleBuildContextPathChange: (selectedBuildContextGitMaterial) => void
    formState: any
    ciConfig: CiPipelineResult
    handleOnChangeConfig: (e) => void
    renderInfoCard: () => JSX.Element
    isDefaultBuildContext: () => boolean
}

export interface CIBuildpackBuildOptionsProps {
    ciBuildConfig: CIBuildConfigType
    sourceConfig: any
    buildersAndFrameworks: BuildersAndFrameworksType
    setBuildersAndFrameworks: React.Dispatch<React.SetStateAction<BuildersAndFrameworksType>>
    configOverrideView: boolean
    allowOverride: boolean
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
}

export interface CIAdvancedConfigProps {
    configOverrideView: boolean
    allowOverride: boolean
    args: CIBuildArgType[]
    setArgs: React.Dispatch<React.SetStateAction<CIBuildArgType[]>>
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

export interface BuildContextProps {
    disable: boolean
    setDisable: React.Dispatch<React.SetStateAction<boolean>>
    formState: any
    configOverrideView: boolean
    allowOverride: boolean
    ciConfig:  CiPipelineResult
    handleOnChangeConfig: (e) => void
}