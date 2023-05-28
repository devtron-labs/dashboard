import React from 'react'
import {
    MaterialType,
    DockerConfigOverrideType,
    FormType,
    CiPipelineSourceTypeOption,
    Githost,
    ErrorObj,
    PluginDetailType,
    MandatoryPluginDetailType,
} from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../services/service.types'

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
}

export interface CIPipelineDataType {
    id: number
    ciMaterial: any[]
    dockerArgs: any
    parentCiPipeline?: number //required in case of linked CI
    parentAppId?: number //required in case of linked CI
    active: true
    externalCiConfig: any
    isExternal: boolean
    isManual: boolean
    name: string
    linkedCount: number
    scanEnabled?: boolean
    isDockerConfigOverridden?: boolean
    dockerConfigOverride?: DockerConfigOverrideType
}
export interface CIPipelineState {
    code: number
    view: string
    showError: boolean
    loadingData: boolean
    form: FormType
    ciPipeline: CIPipelineDataType
    sourcePipelineURL?: string //required Linked CI
    showDeleteModal: boolean
    showDockerArgs: boolean
    showPreBuild: boolean
    showDocker: boolean
    showPostBuild: boolean
    isAdvanced?: boolean //required for CIPipeline
}

export interface LinkedCIPipelineState {
    view: string
    showError: boolean
    loadingData: boolean
    ciPipelines: any[]
    loadingPipelines: boolean
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

export interface Material {
    source: { type: string; value: string }
    gitMaterialId: number
    isSave: boolean
}

export interface CIPipelineProps
    extends RouteComponentProps<{ appId: string; ciPipelineId: string; workflowId: string }> {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
    deleteWorkflow?: (appId?: string, workflowId?: number) => any
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
    inputVariable: (value: object, availableInputVariables: Map<string, boolean>) => ErrorObj
    outputVariable: (value: object, availableInputVariables: Map<string, boolean>) => ErrorObj
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
    setDockerConfigOverridden: React.Dispatch<React.SetStateAction<boolean>>
    isJobView?: boolean
}

export interface PreBuildType {
  presetPlugins: PluginDetailType[]
  sharedPlugins: PluginDetailType[]
  mandatoryPluginsMap: Record<number, MandatoryPluginDetailType>
  isJobView?: boolean
}