import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../../../services/service.types'
import { DeploymentHistoryDetail } from '../cdDetails/cd.type'
import { CIMaterialType } from './MaterialHistory'
import {
    CDMaterialType,
    CDModalTabType,
    CommonNodeAttr,
    DeploymentNodeType,
    UserApprovalConfigType,
    CIBuildConfigType,
    DockerConfigOverrideType,
    ReleaseTag,
    ImageComment,
    DeploymentAppTypes,
} from '@devtron-labs/devtron-fe-common-lib'
import { Environment } from '../../../cdPipeline/cdPipeline.types'

export interface CDMaterialProps {
    material: CDMaterialType[]
    isLoading: boolean
    materialType: string
    envName: string
    redirectToCD?: () => void
    stageType: DeploymentNodeType
    changeTab?: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?: number,
    ) => void
    triggerDeploy: (
        stageType: DeploymentNodeType,
        _appId: number,
        deploymentWithConfig?: string,
        wfrId?: number,
    ) => void
    selectImage: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?:number,
    ) => void
    toggleSourceInfo: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    closeCDModal: (e) => void
    onClickRollbackMaterial?: (
        cdNodeId: number,
        offset?: number,
        size?: number,
        callback?: (loadingMore: boolean, noMoreImages?: boolean) => void,
    ) => void
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
    hideInfoTabsContainer?: boolean
    appId?: number
    pipelineId?: number
    isFromBulkCD?: boolean
    userApprovalConfig?: UserApprovalConfigType
    requestedUserId?: number
    triggerType?: string
    isVirtualEnvironment?: boolean
    isSaveLoading?: boolean
    ciPipelineId?: number
    appReleaseTagNames?: string[]
    setAppReleaseTagNames?: (appReleaseTags: string[]) => void
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    setTagsEditable?: (tagsEditable: boolean) => void
    updateCurrentAppMaterial? : (matId:number, releaseTags?:ReleaseTag[], imageComment?:ImageComment) => void
}

export enum DeploymentWithConfigType {
    LAST_SAVED_CONFIG = 'LAST_SAVED_CONFIG',
    LATEST_TRIGGER_CONFIG = 'LATEST_TRIGGER_CONFIG',
    SPECIFIC_TRIGGER_CONFIG = 'SPECIFIC_TRIGGER_CONFIG',
}

export interface ConfigToDeployOptionType {
    label: string
    value: DeploymentWithConfigType
    infoText: string
}

export interface CDMaterialState {
    isSecurityModuleInstalled: boolean
    checkingDiff: boolean
    diffFound: boolean
    diffOptions: Record<string, boolean>
    showConfigDiffView: boolean
    loadingMore: boolean
    showOlderImages: boolean
    noMoreImages: boolean
    selectedConfigToDeploy: ConfigToDeployOptionType
    isRollbackTrigger: boolean
    recentDeploymentConfig: any
    latestDeploymentConfig: any
    specificDeploymentConfig: any
    selectedMaterial: CDMaterialType
    isSelectImageTrigger: boolean
    materialInEditModeMap: Map<number,boolean>
}

export interface MaterialInfo {
    revision: string
    modifiedTime: string | Date
    author: string
    message: string
    commitLink: string
    tag: string
    webhookData: string
    branch: string
    url?: string
    type?: string
}

export interface CIMaterialRouterProps {
    appId: string
    envId: string
}

export interface CIMaterialProps extends RouteComponentProps<CIMaterialRouterProps> {
    workflowId: number
    material: CIMaterialType[]
    pipelineId: number
    title: string
    isLoading: boolean
    pipelineName: string
    showWebhookModal: boolean
    toggleWebhookModal: (id, webhookTimeStampOrder) => void
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    hideWebhookModal: (e?) => void
    onClickWebhookTimeStamp: () => void
    webhhookTimeStampOrder: string
    showMaterialRegexModal: boolean
    onCloseBranchRegexModal?: () => void
    filteredCIPipelines: any[]
    onClickShowBranchRegexModal: () => void
    showCIModal: boolean
    onShowCIModal: () => void
    isChangeBranchClicked: boolean
    getWorkflows: () => void
    loader: boolean
    setLoader: (isLoading) => void
    isFirstTrigger?: boolean
    isCacheAvailable?: boolean
    fromAppGrouping?: boolean
    appId: string
    isJobView?: boolean
    isCITriggerBlocked?: boolean
    ciBlockState?: {
        action: any,
        metadataField: string
    }
    selectedEnv?: Environment
    setSelectedEnv?: (selectedEnv: Environment) => void;
    environmentLists?: any[]
}

export interface RegexValueType {
    value: string
    isInvalid: boolean
}

export interface CIMaterialState {
    regexValue: Record<number, RegexValueType>
    savingRegexValue: boolean
    selectedCIPipeline?: any
    isBlobStorageConfigured?: boolean
}

export interface NodeAttr extends CommonNodeAttr {
    cipipelineId?: number
}

export interface DownStreams {
    id: string
    text: string
}

interface InputMaterials {
    time: string
    user: string
    commitLink: string
    isActive: boolean
}

export interface TriggerCDNodeProps extends RouteComponentProps<{ appId: string }> {
    x: number
    y: number
    height: number
    width: number
    status: string
    id: string
    downstreams?: string[]
    title: string
    environmentName: string
    environmentId: string
    triggerType: string
    colourCode: string
    deploymentStrategy: string
    inputMaterialList: InputMaterials[]
    rollbackMaterialList: InputMaterials[]
    stageIndex: number
    type: 'CD'
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
    fromAppGrouping: boolean
    description: string
    index?: number
    isVirtualEnvironment?: boolean
}

export interface TriggerPrePostCDNodeProps extends RouteComponentProps<{ appId: string }> {
    x: number
    y: number
    height: number
    width: number
    status: string
    id: string
    environmentId: string
    title: string
    triggerType: string
    colourCode: string
    stageIndex: number
    type: DeploymentNodeType
    downstreams?: string[]
    inputMaterialList: InputMaterials[]
    rollbackMaterialList: InputMaterials[]
    fromAppGrouping: boolean
    description: string
    index?: number
}

export interface TriggerEdgeType {
    startNode: any
    endNode: any
}

export interface WorkflowProps extends RouteComponentProps<{ appId: string }> {
    id: string
    name: string
    startX: number
    startY: number
    width: number
    height: number
    nodes: NodeAttr[]
    appId?: number
    isSelected?: boolean
    fromAppGrouping?: boolean
    handleSelectionChange?: (_appId: number) => void
    isJobView?: boolean
    index?: number
    environmentLists?: any[]
    filteredCIPipelines?: any[]
}

export interface TriggerViewContextType {
    invalidateCache: boolean
    refreshMaterial: (ciNodeId: number, materialId: number) => void
    onClickTriggerCINode: () => void
    onClickTriggerCDNode: (nodeType: DeploymentNodeType, _appId: number) => void
    onClickCIMaterial: (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection?: boolean) => void
    onClickCDMaterial: (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode?: boolean) => void
    onClickRollbackMaterial: (cdNodeId: number, offset?: number, size?: number) => void
    closeCIModal: () => void
    selectCommit: (materialId: string, hash: string) => void
    selectMaterial: (materialId) => void
    toggleChanges: (materialId: string, hash: string) => void
    toggleInvalidateCache: () => void
    getMaterialByCommit: (ciNodeId: number, materialId: number, gitMaterialId: number, commitHash: string) => void
    getFilteredMaterial: (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => void
}

export interface TriggerViewRouterProps {
    appId: string
    envId: string
}

export interface TriggerViewProps extends RouteComponentProps<TriggerViewRouterProps> {
    isJobView?: boolean
}

export interface WorkflowType {
    id: string
    name: string
    gitMaterials?: Material[]
    ciConfiguredGitMaterialId?: number
    startX: number
    startY: number
    width: number
    height: number
    nodes: NodeAttr[]
    dag: any
    showTippy?: boolean
    appId?: number
    isSelected?: boolean
    approvalConfiguredIdsMap?: Record<number, UserApprovalConfigType>
    imageReleaseTags: string[]
    appReleaseTags?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
}

export interface WebhookPayloadDataResponse {
    ParsedDataId: number
    EventTime: string
    MatchedFiltersCount: number
    FailedFiltersCount: number
    MatchedFilters: boolean
}

export interface WebhookPayloads {
    filters: Map<string, string>
    repositoryUrl: string
    payloads: WebhookPayloadDataResponse[] | null
}

export interface TriggerViewState {
    code: number
    view: string
    workflows: WorkflowType[]
    showCDModal: boolean
    showCIModal: boolean
    showApprovalModal: boolean
    nodeType: null | 'CI' | 'CD' | 'PRECD' | 'POSTCD' | 'APPROVAL'
    ciPipelineName: string
    ciNodeId: number | null
    cdNodeId: number
    materialType: '' | 'inputMaterialList' | 'rollbackMaterialList'
    isLoading: boolean
    invalidateCache: boolean
    hostURLConfig: HostURLConfig
    showWebhookModal: boolean
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    workflowId: number
    webhhookTimeStampOrder: string
    showMaterialRegexModal: boolean
    filteredCIPipelines: any[]
    isChangeBranchClicked: boolean
    loader: boolean
    isSaveLoading?: boolean
    selectedEnv?: Environment
    environmentLists?: any[]
    appReleaseTags?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
}

//-- begining of response type objects for trigger view

export interface TriggerViewResponse {
    ciPipelineId: number
    ciPipelineName: string
    cdPipelineId: number
    cdPipelineName: string
    status: string
    statusMessage: string
    lastDeployedTime: string
    lastDeployedBy: string
    materialInfo: any
    releaseVersion: string
    dataSource: string
    conditions?: ApplicationConditionResponse[]
}

export interface ApplicationConditionResponse {
    type: string
    message: string
}

export enum PipelineType {
    CI_PIPELINE = 'CI_PIPELINE',
    CD_PIPELINE = 'CD_PIPELINE',
    WEBHOOK = 'WEBHOOK',
}

export enum CIPipelineNodeType {
    EXTERNAL_CI = 'EXTERNAL-CI',
    CI = 'CI',
    LINKED_CI = 'LINKED-CI',
}

export enum WorkflowNodeType {
    GIT = 'GIT',
    CI = 'CI',
    WEBHOOK = 'WEBHOOK',
    PRE_CD = 'PRECD',
    CD = 'CD',
    POST_CD = 'POSTCD',
}

export interface Task {
    name?: string
    type?: string
    cmd?: string
    args?: Array<string>
}

//Start Workflow Response
export interface Tree {
    id: number
    appWorkflowId: number
    type: PipelineType
    componentId: number
    parentId: number
    parentType: PipelineType
}

export interface Workflow {
    id: number
    name: string
    appId: number
    tree?: Tree[]
}

export interface WorkflowResult {
    appId: number
    appName: string
    workflows: Workflow[]
}
//End Workflow Response

//Start CI Response
export interface DockerBuildConfig {
    gitMaterialId: number
    dockerfileRelativePath: string
    args?: Map<string, string>
    targetPlatform: any
}

export interface ExternalCiConfig {
    id: number
    webhookUrl: string
    payload: string
    accessKey: string
}

export interface Source {
    type: string
    value?: string
    regex?: string
}

export interface CiMaterial {
    source: Source
    gitMaterialId: number
    id: number
    gitMaterialName: string
    isRegex?: boolean
}

export interface CiScript {
    id: number
    index: number
    name: string
    script: string
    outputLocation?: string
}

export interface CiPipeline {
    isManual: boolean
    dockerArgs?: Map<string, string>
    isExternal: boolean
    parentCiPipeline: number
    parentAppId: number
    externalCiConfig: ExternalCiConfig
    ciMaterial?: CiMaterial[]
    name?: string
    id?: number
    active?: boolean
    linkedCount: number
    scanEnabled: boolean
    deleted?: boolean
    version?: string
    beforeDockerBuild?: Array<Task>
    afterDockerBuild?: Array<Task>
    appWorkflowId?: number
    beforeDockerBuildScripts?: Array<CiScript>
    afterDockerBuildScripts?: Array<CiScript>
    isDockerConfigOverridden?: boolean
    dockerConfigOverride?: DockerConfigOverrideType
    appName?: string
    appId?: string
    componentId?: number
    isCITriggerBlocked?: boolean
    ciBlockState?: {
        action: any,
        metadataField: string
    }
    isOffendingMandatoryPlugin?: boolean
}

export interface Material {
    gitMaterialId: number
    materialName: string
}

export interface CiPipelineResult {
    id?: number
    appId?: number
    dockerRegistry?: string
    dockerRepository?: string
    ciBuildConfig?: CIBuildConfigType
    ciPipelines?: CiPipeline[]
    appName?: string
    version?: string
    materials: Material[]
    scanEnabled: boolean
    appWorkflowId?: number
    beforeDockerBuild?: Array<Task>
    afterDockerBuild?: Array<Task>
    ciGitConfiguredId?: number
}
//End CI Response

//Start CD response
export interface Strategy {
    deploymentTemplate: string
    config: any
    default?: boolean
}

export interface CDStage {
    status: string
    name: string
    triggerType: 'AUTOMATIC' | 'MANUAL'
    config: string
}

export interface CDStageConfigMapSecretNames {
    configMaps: any[]
    secrets: any[]
}

export interface CdPipeline {
    id: number
    environmentId: number
    environmentName?: string
    description?: string
    ciPipelineId: number
    triggerType: 'AUTOMATIC' | 'MANUAL'
    name: string
    strategies?: Strategy[]
    namespace?: string
    appWorkflowId?: number
    deploymentTemplate?: string
    preStage?: CDStage
    postStage?: CDStage
    preStageConfigMapSecretNames?: CDStageConfigMapSecretNames
    postStageConfigMapSecretNames?: CDStageConfigMapSecretNames
    runPreStageInEnv?: boolean
    runPostStageInEnv?: boolean
    isClusterCdActive?: boolean
    parentPipelineId?: number
    parentPipelineType?: string
    deploymentAppDeleteRequest?: boolean
    deploymentAppCreated?: boolean
    userApprovalConfig?: UserApprovalConfigType
    isVirtualEnvironment?: boolean
    deploymentAppType: DeploymentAppTypes
    helmPackageName?: string
}

export interface CdPipelineResult {
    pipelines?: CdPipeline[]
    appId: number
}

//End CD response

type PartialNodeAttr = Partial<NodeAttr>

export interface FullNode {
    node: PartialNodeAttr
    hasPre: true
    hasPost: true
}

export interface WorkflowDisplay {
    id: number
    name: string
    nodes: Array<NodeAttr>
    type: string
}

export interface BranchRegexModalProps {
    material
    selectedCIPipeline
    showWebhookModal: boolean
    title: string
    isChangeBranchClicked: boolean
    onClickNextButton: () => void
    onShowCIModal: () => void
    handleRegexInputValue: (id, value, mat) => void
    regexValue
    onCloseBranchRegexModal
    hideHeaderFooter?: boolean
    savingRegexValue: boolean
}
export interface AppDetailsProps {
    isV2: boolean
}

export interface TriggerViewDeploymentConfigType {
    configMap: DeploymentHistoryDetail[]
    deploymentTemplate: DeploymentHistoryDetail
    pipelineStrategy: DeploymentHistoryDetail
    secret: DeploymentHistoryDetail[]
}

export interface TriggerViewConfigDiffProps {
    currentConfiguration: TriggerViewDeploymentConfigType
    baseTemplateConfiguration: TriggerViewDeploymentConfigType
    selectedConfigToDeploy
    handleConfigSelection: (selected) => void
    isConfigAvailable: (optionValue) => boolean
    diffOptions: Record<string, boolean>
    isRollbackTriggerSelected: boolean
    isRecentConfigAvailable: boolean
}

export const MATERIAL_TYPE = {
    rollbackMaterialList: 'rollbackMaterialList',
    inputMaterialList: 'inputMaterialList',
    none: 'none',
}

export const STAGE_TYPE = {
    CD: 'CD',
    CI: 'CI',
    GIT: 'GIT',
    PRECD: 'PRECD',
    POSTCD: 'POSTCD',
    ROLLBACK: 'ROLLBACK',
}

export interface EmptyStateCIMaterialProps {
    isRepoError: boolean
    isBranchError: boolean
    isDockerFileError: boolean
    dockerFileErrorMsg: string
    gitMaterialName: string
    sourceValue: string
    repoUrl: string
    branchErrorMsg: string
    repoErrorMsg: string
    isMaterialLoading: boolean
    onRetry: (...args) => void
    anyCommit: boolean
    isWebHook?: boolean
    noSearchResults?: boolean
    noSearchResultsMsg?: string
    toggleWebHookModal?: () => void
    clearSearch?: (e) => void
    handleGoToWorkFlowEditor?: (e?: any) => void
    showAllCommits?: boolean
    toggleExclude: (e) => void
}

export interface MaterialSourceProps {
    material: CIMaterialType[]
    selectMaterial: (materialId: string, ciPipelineId?: number) => void
    refreshMaterial?: {
        pipelineId: number
        refresh: (pipelineId: number, gitMaterialId: number) => void
    }
    ciPipelineId?: number
    fromTriggerInfo?: boolean
    clearSearch?: (e: any) => void
}
