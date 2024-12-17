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

import {
    MaterialType,
    DockerConfigOverrideType,
    CiPipelineSourceTypeOption,
    Githost,
    ErrorObj,
    RefVariableType,
    ScriptType,
    PluginType,
    CustomTagType,
    PipelineFormType,
    OptionType,
    DynamicDataTableCellValidationState,
} from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps } from 'react-router-dom'
import { ValidateInputOutputVariableCellProps } from '@Components/CIPipelineN/VariableDataTable/types'
import { HostURLConfig } from '../../services/service.types'
import { ChangeCIPayloadType } from '../workflowEditor/types'

export interface ExternalCIPipelineState {
    code: number
    view: string
    showError: boolean
    loadingData: boolean
    form: {
        name: string
        args: { key: string; value: string }[]
        materials: MaterialType[]
        triggerType: string
        externalCiConfig: string
        ciPipelineSourceTypeOptions: []
    }
    ciPipeline: {
        id: number
        ciMaterial: any[]
        dockerArgs: any
        active: true
        externalCiConfig: {
            id: number
            accessKey: string
            payload: string
            webhookUrl: string
        }
        isExternal: boolean
        isManual: boolean
        name: string
        linkedCount: number
    }
    gitMaterials: { gitMaterialId: number; materialName: string }[]
    showDeleteModal: boolean
    showDockerArgs: boolean
    hostURLConfig: HostURLConfig
}

export enum ConditionContainerType {
    TRIGGER_SKIP = 'Trigger/Skip',
    PASS_FAILURE = 'Pass/Failure',
}

export enum PluginVariableType {
    INPUT = 'Input',
    OUTPUT = 'Output',
}

export enum TaskFieldLabel {
    CONTAINERIMAGEPATH = 'Container image',
    COMMAND = 'command',
    ARGS = 'args',
    PORTMAPPING = 'Port mapping',
    MOUNTCODETOCONTAINER = 'Mount code to container',
    MOUNTDIRECTORYFROMHOST = 'Mount directory from host',
    OUTPUTVARIABLES = 'Output variables',
    OUTPUTDIRECTORYPATH = 'Output directory path',
    SCRIPT = 'Script',
    CODE = 'Code',
    MOUNTCODEAT = 'Mount above code at',
    MOUNTCODESNIPPET = 'Mount custom code',
}

export const TaskFieldDescription = {
    INPUT: 'These variables are available as environment variables and can be used in the script to inject values from previous tasks or other sources.',
    OUTPUT: 'These variables should be set in the environment variables and can be used as input variables in other scripts.',
    CONTAINERIMAGEPATH: 'Complete verified public url of the container image',
    COMMAND: 'It contains the commands to execute on this container.',
    ARGS: 'This is used to give arguments to command.',
    PORTMAPPING:
        'Port container listens on. This can be used to expose ports of this container so they can be called from outside. ',
    MOUNTCODETOCONTAINER: 'Mounts source code inside the container.',
    MOUNTDIRECTORYFROMHOST:
        'Mount any directory from the host into the container. This can be used to mount code or even output directories.',
    OUTPUTVARIABLES:
        'These variables should be set in the environment variables and can be used as input variables in other scripts.',
    OUTPUTDIRECTORYPATH:
        'Directory in which the script is writing/producing output files (eg. test report, zip files etc)',
    SCRIPT: 'You can invoke this script from the container',
    CODE: 'You can invoke this code from the container',
    MOUNTCODEAT: 'Path where code should be mounted',
    MOUNTCODESNIPPET: 'Enable this if you want to mount custom code in the container',
}

export const MountPathMap = {
    FILEPATHONDISK: 'filePathOnDisk',
    FILEPATHONCONTAINER: 'filePathOnContainer',
}

export const PortMap = {
    PORTONLOCAL: 'portOnLocal',
    PORTONCONTAINER: 'portOnContainer',
}

export enum MountPath {
    TRUE = 'Yes',
    FALSE = 'No',
}

export enum ConditionType {
    SKIP = 'SKIP',
    TRIGGER = 'TRIGGER',
    PASS = 'PASS',
    FAIL = 'FAIL',
}

export enum RefVariableStageType {
    PRE_CI = 'PRE_CI',
    POST_CI = 'POST_CI',
}

export interface VariableType {
    id: number
    name: string
    value: string
    format: string
    description: string
    defaultValue: string
    variableType: RefVariableType
    refVariableStepIndex: number
    refVariableName: string
    refVariableStage?: RefVariableStageType
    variableStepIndexInPlugin?: number
}

interface CommandArgsMap {
    command: string
    args: string[]
}

export interface PortMapType {
    portOnLocal: number
    portOnContainer: number
}
interface ConditionDetails {
    id: number
    conditionOnVariable: string
    conditionOperator: string
    conditionType: ConditionType
    conditionalValue: string
}

interface InlineStepDetailType {
    scriptType: ScriptType
    isMountCustomScript?: boolean
    script?: string
    dockerFileExists?: boolean
    mountPath?: string
    mountCodeToContainer?: boolean
    mountDirectoryFromHost?: boolean
    containerImagePath?: string
    imagePullSecret?: string
    commandArgsMap?: CommandArgsMap[]
    portMap?: PortMapType[]
    mountPathMap?: {
        filePathOnDisk: string
        filePathOnContainer: string
    }[]
    inputVariables?: VariableType[]
    outputVariables?: VariableType[]
    conditionDetails: ConditionDetails[]
}

interface PluginRefStepDetailType {
    id: number
    pluginId: number
    inputVariables?: VariableType[]
    outputVariables?: VariableType[]
    conditionDetails?: ConditionDetails[]
}

export interface StepType {
    id: number
    index: number
    name: string
    description: string
    stepType: PluginType
    outputDirectoryPath: string[]
    inlineStepDetail?: InlineStepDetailType
    pluginRefStepDetail?: PluginRefStepDetailType
    triggerIfParentStageFail: boolean
}

export interface BuildStageType {
    id: number
    steps: StepType[]
}

export enum CIBuildType {
    SELF_DOCKERFILE_BUILD_TYPE = 'self-dockerfile-build',
    MANAGED_DOCKERFILE_BUILD_TYPE = 'managed-dockerfile-build',
    BUILDPACK_BUILD_TYPE = 'buildpack-build',
}

export interface BuildPackConfigType {
    builderId: string
    language: string
    languageVersion: string
    projectPath: string
    builderLangEnvParam?: string
    currentBuilderLangEnvParam?: string
    buildPacks?: any
    args?: Record<string, string>
}

export interface DockerBuildConfigType {
    dockerfileContent: string
    dockerfileRelativePath: string
    buildContext: string
    dockerfilePath?: string
    dockerfileRepository?: string
    args?: Record<string, string>
    targetPlatform?: any
    language?: string
    languageFramework?: string
}

export interface CIBuildConfigType {
    buildPackConfig: BuildPackConfigType
    ciBuildType: CIBuildType
    dockerBuildConfig: DockerBuildConfigType
    gitMaterialId: number
    buildContextGitMaterialId: number
    id?: number
    useRootBuildContext: boolean
}

export const DockerConfigOverrideKeys = {
    id: 'id',
    ciBuildConfig: 'ciBuildConfig',
    buildPackConfig: 'buildPackConfig',
    dockerBuildConfig: 'dockerBuildConfig',
    isDockerConfigOverridden: 'isDockerConfigOverridden',
    dockerRegistry: 'dockerRegistry',
    dockerRepository: 'dockerRepository',
    repository_name: 'repository_name',
    projectPath: 'projectPath',
    dockerfile: 'dockerfile',
    dockerfileRelativePath: 'dockerfileRelativePath',
    targetPlatform: 'targetPlatform',
    buildContext: 'buildContext',
}

export interface CIPipelineType {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
    deleteWorkflow: (appId?: string, workflowId?: number) => any
    isJobView?: boolean
    isJobCI?: boolean
    changeCIPayload?: ChangeCIPayloadType
}

export interface CIPipelineDataType {
    id: number
    ciMaterial: any[]
    dockerArgs: any
    parentCiPipeline?: number // required in case of linked CI
    parentAppId?: number // required in case of linked CI
    active: true
    externalCiConfig: any
    isExternal: boolean
    isManual: boolean
    name: string
    linkedCount: number
    scanEnabled?: boolean
    isDockerConfigOverridden?: boolean
    dockerConfigOverride?: DockerConfigOverrideType
    environmentId?: any
    pipelineType?: string
    customTag?: CustomTagType
}
export interface CIPipelineState {
    code: number
    view: string
    showError: boolean
    loadingData: boolean
    form: PipelineFormType
    ciPipeline: CIPipelineDataType
    sourcePipelineURL?: string // required Linked CI
    showDeleteModal: boolean
    showDockerArgs: boolean
    showPreBuild: boolean
    showDocker: boolean
    showPostBuild: boolean
    isAdvanced?: boolean // required for CIPipeline
}

export interface LinkedCIPipelineState {
    view: string
    showError: boolean
    loadingData: boolean
    ciPipelines: any[]
    loadingPipelines: boolean
    showPluginWarning: boolean
    form: {
        parentAppId: number
        parentCIPipelineId: number
        name: string
    }
    isValid: {
        parentAppId: boolean
        parentCIPipelineId: boolean
        name: boolean
    }
}

export interface CIPipelineProps
    extends RouteComponentProps<{ appId: string; ciPipelineId: string; workflowId: string }> {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
    deleteWorkflow?: (appId?: string, workflowId?: number) => any
    changeCIPayload?: ChangeCIPayloadType
}

export const PatchAction = {
    CREATE: 0,
    UPDATE_SOURCE: 1,
    DELETE: 2,
}

export enum VariableFieldType {
    Input = 'inputVariables',
    Output = 'outputVariables',
}

export interface ValidationRulesType {
    name: (value: string) => ErrorObj
    requiredField: (value: string) => ErrorObj
    validateInputOutputVariableCell: (
        props: ValidateInputOutputVariableCellProps,
    ) => DynamicDataTableCellValidationState
    conditionDetail: (value: object) => ErrorObj
    sourceValue: (value: string) => ErrorObj
    mountPathMap: (value: object) => ErrorObj
}
export interface SourceMaterialsProps {
    materials: MaterialType[]
    showError: boolean
    validationRules?: ValidationRulesType
    selectSourceType?: (event, gitMaterialId) => void
    handleSourceChange?: (event, gitMaterialId: number, type: string) => void
    includeWebhookEvents: boolean
    ciPipelineSourceTypeOptions: CiPipelineSourceTypeOption[]
    canEditPipeline: boolean
    webhookData?: WebhookCIProps
    isBranchRegex?: (material) => boolean
    isAdvanced?: boolean
    handleOnBlur?: () => Promise<void>
}

export interface WebhookCIProps {
    webhookConditionList: any
    gitHost: Githost
    getSelectedWebhookEvent: (material: any) => any
    addWebhookCondition: () => void
    deleteWebhookCondition: (index: number) => void
    onWebhookConditionSelectorChange: (index: number, selectorId: number) => void
    onWebhookConditionSelectorValueChange: (index: number, value: string) => void
    copyToClipboard: (text: string, callback) => void
}

export interface BuildType {
    showFormError: boolean
    isAdvanced: boolean
    ciPipeline: CIPipelineDataType
    pageState: string
    isSecurityModuleInstalled: boolean
    isJobView?: boolean
    getPluginData: (_formData?: PipelineFormType) => Promise<void>
}

export interface PreBuildType {
    isJobView?: boolean
}

export enum CIPipelineBuildType {
    CI_JOB = 'CI_JOB',
    CI_BUILD = 'CI_BUILD',
    CI_LINKED = 'LINKED',
    LINKED_CD = 'LINKED_CD',
    NORMAL_JOB = 'NORMAL_JOB',
}

export interface SelectedConditionType {
    selectorId: number
    value: string
}

export interface WebhookConditionType {
    conditionIndex: number
    masterSelectorList: OptionType[]
    selectorCondition: SelectedConditionType
    onSelectorChange: (selectorId: number, value: number) => void
    onSelectorValueChange: (index: number, value: string) => void
    deleteWebhookCondition: (index: number) => void
    canEditSelectorCondition: boolean
}
