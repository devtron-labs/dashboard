import { RouteComponentProps } from 'react-router'
import { HostURLConfig } from '../../../../services/service.types'
export type CDModalTabType = 'SECURITY' | 'CHANGES'

export interface CDMaterialProps {
    material: CDMaterialType[]
    isLoading: boolean
    materialType: string
    envName: string
    redirectToCD?: () => void
    stageType: string
    changeTab?: (materrialId: string | number, artifactId: number, tab: CDModalTabType) => void
    triggerDeploy: (stageType: string) => void
    selectImage: (index: number, materialType: string) => void
    toggleSourceInfo: (materialIndex: number) => void
    closeCDModal: () => void
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
}

export interface CDMaterialType {
    id: string
    materialInfo: {
        revision: string
        modifiedTime: string
        author: string
        message: string
        commitLink: string
        tag: string
        webhookData: string
    }[]
    tab: CDModalTabType
    scanEnabled: boolean
    scanned: boolean
    vulnerabilitiesLoading: boolean
    lastExecution: string //timestamp
    vulnerabilities: VulnerabilityType[]
    vulnerable: boolean
    deployedTime: string
    buildTime: string
    image: string
    isSelected: boolean
    showSourceInfo: boolean
    latest: boolean
    runningOnParentCd?: boolean
}

interface VulnerabilityType {}

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
    hideWebhookModal: () => void
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
}

export interface RegexValueType
    extends Record<
        number,
        {
            value: string
            isInvalid: boolean
        }
    > {}

export interface CIMaterialState {
    regexValue: RegexValueType
    selectedCIPipeline?: any
    loader: boolean
}

export interface NodeAttr {
    connectingCiPipelineId?: number
    parents: string | number[] | string[]
    x: number
    y: number
    title: string
    description?: string
    triggerType?: string
    id: string
    icon?: string
    status?: string
    isSource: boolean
    isGitSource: boolean
    isRoot: boolean
    downstreams: string[]
    type: 'CI' | 'GIT' | 'PRECD' | 'CD' | 'POSTCD'
    parentCiPipeline?: number
    parentAppId?: number
    url?: string
    branch?: string
    sourceType?: string
    colorCode?: string
    isExternalCI?: boolean
    isLinkedCI?: boolean
    environmentName?: string //used for CDs
    environmentId?: number
    inputMaterialList?: any[]
    rollbackMaterialList?: any[] //used for CDs
    linkedCount?: number //used for CI
    deploymentStrategy?: string
    height: number
    width: number
    preNode?: NodeAttr //used for CDs
    postNode?: NodeAttr //used for CDs
    stageIndex?: number //used for CDs
    sourceNodes?: Array<NodeAttr> //used for CI
    downstreamNodes?: Array<NodeAttr>
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
    isRegex?: boolean
    regex?: string
    primaryBranchAfterRegex?: string
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
    type: 'PRECD' | 'CD' | 'POSTCD'
    downstreams?: string[]
    inputMaterialList: InputMaterials[]
    rollbackMaterialList: InputMaterials[]
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
}

export interface TriggerViewRouterProps {
    appId: string
    envId: string
}

export interface TriggerViewProps extends RouteComponentProps<TriggerViewRouterProps> {}

export interface WorkflowType {
    id: string
    name: string
    startX: number
    startY: number
    width: number
    height: number
    nodes: NodeAttr[]
    dag: any
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
    nodeType: null | 'CI' | 'CD' | 'PRECD' | 'POSTCD'
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

export interface SelectedCIMaterial {
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
    linkedCount: number
    scanEnabled: boolean
    isExternal: boolean
    parentCiPipeline: number
    parentAppId: number
    externalCiConfig: ExternalCiConfig
    dockerArgs?: Map<string, string>
    ciMaterial?: SelectedCIMaterial[]
    name?: string
    id?: number
    active?: boolean
    deleted?: boolean
    version?: string
    beforeDockerBuild?: Array<Task>
    afterDockerBuild?: Array<Task>
    appWorkflowId?: number
    beforeDockerBuildScripts?: Array<CiScript>
    afterDockerBuildScripts?: Array<CiScript>
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
    dockerBuildConfig?: DockerBuildConfig
    ciPipelines?: CiPipeline[]
    appName?: string
    version?: string
    materials: Material[]
    scanEnabled: boolean
    appWorkflowId?: number
    beforeDockerBuild?: Array<Task>
    afterDockerBuild?: Array<Task>
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
    context
    onClickNextButton: (context) => void
    onShowCIModal: () => void
    handleRegexInputValue: (id, value, mat) => void
    regexValue
    onCloseBranchRegexModal
}

export interface WebhookData {
    id: number
    eventActionType: string
    data: any
}

export interface CommitHistory {
    author: string
    commitURL: string
    changes: string[]
    commit: string
    date: string
    message: string
    isSelected: boolean
    showChanges: boolean
    webhookData: WebhookData
}

export interface CIMaterialType {
    id: number
    gitMaterialName: string
    gitMaterialId: number
    gitURL: string
    type: string
    value: string
    active: boolean
    history: CommitHistory[]
    isSelected: boolean
    lastFetchTime: string
    isRepoError?: boolean
    repoErrorMsg?: string
    isBranchError?: boolean
    branchErrorMsg?: string
    isMaterialLoading?: boolean
    regex: string
    searchText?: string
    noSearchResultsMsg?: string
    noSearchResult?: boolean
    isRegex: boolean
    gitMaterialUrl?: string
}

export interface MaterialHistoryProps {
    material: CIMaterialType
    pipelineName: string
    selectCommit?: (materialId: string, commit: string) => void
    toggleChanges: (materialId: string, commit: string) => void
}
