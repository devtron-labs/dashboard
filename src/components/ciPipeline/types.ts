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

export enum PluginType {
    INLINE = 'INLINE',
    PLUGIN_REF = 'REF_PLUGIN',
}

export enum ConditionContainerType {
    TRIGGER_SKIP = 'Trigger/Skip',
    PASS_FAILURE = 'Pass/Failure',
}

export enum PluginVariableType {
    INPUT = 'Input',
    OUTPUT = 'Output',
}

export enum RefVariableType {
    GLOBAL = 'GLOBAL',
    FROM_PREVIOUS_STEP = 'FROM_PREVIOUS_STEP',
    NEW = 'NEW',
}

export enum ScriptType {
    SHELL = 'SHELL',
    DOCKERFILE = 'DOCKERFILE',
    CONTAINERIMAGE = 'CONTAINER_IMAGE',
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
}

export interface BuildStageType {
    id: number
    steps: StepType[]
}
export interface FormType {
    name: string
    args: { key: string; value: string }[]
    materials: MaterialType[]
    gitHost: Githost
    webhookEvents: WebhookEvent[]
    ciPipelineSourceTypeOptions: CiPipelineSourceTypeOption[]
    webhookConditionList: { selectorId: number; value: string }[]
    triggerType: string
    scanEnabled?: boolean
    beforeDockerBuildScripts?: {
        id: number
        name: string
        outputLocation: string
        script: string
        isCollapsed: boolean
        index: number
    }[]
    afterDockerBuildScripts?: {
        id: number
        name: string
        outputLocation: string
        script: string
        isCollapsed: boolean
        index: number
    }[]
    ciPipelineEditable: true
    preBuildStage?: BuildStageType
    postBuildStage?: BuildStageType
}

interface ErrorObj {
    isValid: boolean
    message: string | null
}
export interface TaskErrorObj {
    isValid: boolean
    name: ErrorObj
    inlineStepDetail?: { inputVariables?: ErrorObj[]; outputVariables?: ErrorObj[] }
    pluginRefStepDetail?: { inputVariables?: ErrorObj[]; outputVariables?: ErrorObj[] }
}
export interface FormErrorObjectType {
    name: ErrorObj
    materials?: MaterialType[]
    preBuildStage?: {
        isValid: boolean
        steps: TaskErrorObj[]
    }
    buildStage?: {
        isValid: boolean
        name: ErrorObj
    }
    postBuildStage?: {
        isValid: boolean
        steps: TaskErrorObj[]
    }
}

export interface CIPipelineType {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
    deleteWorkflow: (appId?: string, workflowId?: number) => any
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

export interface MaterialType {
    name: string
    type: string
    value: string
    gitMaterialId: number
    id: number
    isSelected: boolean
    gitHostId: number
    gitProviderId: number
    regex?: string
    isRegex: boolean
}

export interface Githost {
    id: number
    name: string
    active: boolean
    webhookSecret: string
    webhookUrl: string
}

export interface WebhookEvent {
    id: number
    gitHostId: number
    name: string
    isActive: boolean
    selectors: WebhookEventSelectors[]
}

interface WebhookEventSelectors {
    id: number
    eventId: number
    name: string
    selector: string
    toShowInCiFilter: boolean
    fixValue: string
    toShow: boolean
    possibleValues: string
    isActive: boolean
}

export interface CIPipelineProps
    extends RouteComponentProps<{ appId: string; ciPipelineId: string; workflowId: string }> {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
}

export const PatchAction = {
    CREATE: 0,
    UPDATE_SOURCE: 1,
    DELETE: 2,
}

export interface CiPipelineSourceTypeOption {
    label: string
    value: string
    isDisabled: boolean
    isSelected: boolean
    isWebhook: boolean
}

export interface PluginDetailType {
    id: number
    name: string
    type: string
    description: string
    icon: string
    tags: string[]
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
    ciPipelineId: number
    pageState: string
    isSecurityModuleInstalled: boolean
}