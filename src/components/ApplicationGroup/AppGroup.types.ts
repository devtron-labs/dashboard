import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { MultiValue } from 'react-select'
import {
    CDModalTabType,
    DeploymentNodeType,
    UserApprovalConfigType,
    WebhookPayloads,
    WorkflowNodeType,
    WorkflowType,
} from '../app/details/triggerView/types'
import { OptionType } from '../app/types'
import { AppFilterTabs, BulkResponseStatus } from './Constants'

interface BulkTriggerAppDetailType {
    workFlowId: string
    appId: number
    name: string
    material?: any[]
    warningMessage?: string
}

export interface BulkCIDetailType extends BulkTriggerAppDetailType {
    ciPipelineName: string
    ciPipelineId: string
    isFirstTrigger: boolean
    isCacheAvailable: boolean
    isLinkedCI: boolean
    isWebhookCI: boolean
    parentAppId: number
    parentCIPipelineId: number
    errorMessage: string
    hideSearchHeader: boolean
    filteredCIPipelines: any
}

export interface BulkCDDetailType extends BulkTriggerAppDetailType {
    cdPipelineName?: string
    cdPipelineId?: string
    stageType?: DeploymentNodeType
    triggerType?: string
    envName: string
    parentPipelineId?: string
    parentPipelineType?: WorkflowNodeType
    parentEnvironmentName?: string
    approvalUsers?: string[]
    userApprovalConfig?: UserApprovalConfigType
    requestedUserId?: number
}

export interface ResponseRowType {
    appId: string
    appName: string
    status: BulkResponseStatus
    statusText: string
    message: string
}

export interface BulkCITriggerType {
    appList: BulkCIDetailType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any[]>) => void
    onClickTriggerBulkCI: (appIgnoreCache: Record<number, boolean>, appsToRetry?: Record<string, boolean>) => void
    showWebhookModal: boolean
    toggleWebhookModal: (id, webhookTimeStampOrder) => void
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    hideWebhookModal: (e?) => void
    isShowRegexModal: (_appId: number, ciNodeId: number, inputMaterialList: any[]) => boolean
    responseList: ResponseRowType[]
    isLoading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export interface BulkCDTriggerType {
    stage: DeploymentNodeType
    appList: BulkCDDetailType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any>) => void
    onClickTriggerBulkCD: (appsToRetry?: Record<string, boolean>) => void
    changeTab: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    toggleSourceInfo: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    selectImage: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    responseList: ResponseRowType[]
    isLoading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ProcessWorkFlowStatusType {
    cicdInProgress: boolean
    workflows: WorkflowType[]
}

export interface CIWorkflowStatusType {
    ciPipelineId: number
    ciPipelineName: string
    ciStatus: string
    storageConfigured: boolean
}

export interface CDWorkflowStatusType {
    ci_pipeline_id: number
    pipeline_id: number
    deploy_status: string
    pre_status: string
    post_status: string
}

export interface WorkflowsResponseType {
    workflows: WorkflowType[]
    filteredCIPipelines: Map<string, any>
}

export interface TriggerResponseModalType {
    closePopup: (e) => void
    responseList: ResponseRowType[]
    isLoading: boolean
    onClickRetryBuild: (appsToRetry: Record<string, boolean>) => void
}

export interface WorkflowNodeSelectionType {
    id: number
    name: string
    type: WorkflowNodeType
}
export interface WorkflowAppSelectionType {
    id: number
    name: string
    preNodeAvailable: boolean
    postNodeAvailable: boolean
}

export interface ConfigAppList {
    id: number
    name: string
}

export interface EnvApp {
    envCount: number
    envList: EnvAppList[]
}

export interface EnvDeploymentStatus {
    appId: number
    pipelineId: number
    deployStatus: string
    wfrId?: number
}
export interface EnvAppList {
    id: number
    environment_name: string
    cluster_name: string
    active: boolean
    default: boolean
    namespace: string
    isClusterCdActive: boolean
    environmentIdentifier: string
    appCount: number
}

export interface EmptyEnvState {
    title?: string
    subTitle?: string
    actionHandler?: () => void
}

export interface AppInfoListType {
    application: string
    appStatus: string
    deploymentStatus: string
    lastDeployed: string
    appId: number
    envId: number
}

export interface AppListDataType {
    environment: string
    namespace: string
    cluster: string
    appInfoList: AppInfoListType[]
}

export interface EnvSelectorType {
    onChange: (e) => void
    envId: number
    envName: string
}

export interface ApplicationRouteType {
    envListData: ConfigAppList
}

export interface EnvironmentsListViewType {
    removeAllFilters: () => void
    isSuperAdmin: boolean
}

export interface AppOverridesType {
    appList?: ConfigAppList[]
    environments: any
    setEnvironments: any
}

export interface EnvHeaderType {
    envName: string
    setEnvName: (label: string) => void
    setShowEmpty: (empty: boolean) => void
    showEmpty: boolean
    appListOptions: OptionType[]
    selectedAppList: MultiValue<OptionType>
    setSelectedAppList: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
    selectedFilterTab: AppFilterTabs
    setSelectedFilterTab: React.Dispatch<React.SetStateAction<AppFilterTabs>>
    groupFilterOptions: GroupOptionType[]
    selectedGroupFilter: MultiValue<GroupOptionType>
    setSelectedGroupFilter: React.Dispatch<React.SetStateAction<MultiValue<GroupOptionType>>>
    openCreateGroup: (e, groupId?: string) => void
    openDeleteGroup: (e, groupId: string) => void
    isSuperAdmin: boolean
}

export interface AppGroupAdminType {
    isSuperAdmin: boolean
}

export interface AppGroupDetailDefaultType {
    filteredAppIds: string
    appGroupListData?: AppGroupListType
}

interface CIPipeline {
    appName: string
    appId: number
    id: number
    parentCiPipeline: number
    parentAppId: number
}
export interface CIConfigListType {
    pipelineList: CIPipeline[]
    securityModuleInstalled: boolean
    blobStorageConfigured: boolean
}

export interface AppGroupAppFilterContextType {
    appListOptions: OptionType[]
    selectedAppList: MultiValue<OptionType>
    setSelectedAppList: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
    isMenuOpen: boolean
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
    selectedFilterTab: AppFilterTabs
    setSelectedFilterTab: React.Dispatch<React.SetStateAction<AppFilterTabs>>
    groupFilterOptions: GroupOptionType[]
    selectedGroupFilter: MultiValue<GroupOptionType>
    setSelectedGroupFilter: React.Dispatch<React.SetStateAction<MultiValue<GroupOptionType>>>
    openCreateGroup: (e, groupId?: string) => void
    openDeleteGroup: (e, groupId: string) => void
    isSuperAdmin: boolean
}

export interface CreateGroupAppListType {
    id: string
    appName: string
    isSelected: boolean
}

export interface CreateGroupType {
    appList: CreateGroupAppListType[]
    selectedAppGroup: GroupOptionType
    closePopup: (e, groupId?: number) => void
}

export interface ApplistEnvType {
    appId: number
    appName: string
    appStatus: string
    lastDeployedTime: string
}

export interface AppGroupListType {
    namespace: string
    environmentName: string
    clusterName: string
    environmentId: number
    apps: ApplistEnvType[]
}
export interface ConfigAppListType extends ResponseType {
    result?: ConfigAppList[]
}
export interface EnvAppType extends ResponseType {
    result?: EnvApp
}

export interface AppGroupList extends ResponseType {
    result?: AppGroupListType
}

export interface EnvDeploymentStatusType extends ResponseType {
    result?: EnvDeploymentStatus[]
}

export interface EnvGroupListType {
    id: number
    name: string
    appIds: number[]
    description: string
}

export interface EnvGroupListResponse extends ResponseType {
    result?: EnvGroupListType[]
}

export interface EnvGroupResponse extends ResponseType {
    result?: EnvGroupListType
}

export interface GroupOptionType extends OptionType {
    appIds: number[]
    description: string
}

export interface SearchBarType {
    placeholder: string
    searchText: string
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchApplied: boolean
    setSearchApplied: React.Dispatch<React.SetStateAction<boolean>>
}
