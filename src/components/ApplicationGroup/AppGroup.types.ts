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

import { Dispatch, SetStateAction } from 'react'
import { MultiValue } from 'react-select'

import {
    ACTION_STATE,
    AppInfoListType,
    ApprovalConfigDataType,
    CDModalTabType,
    CIMaterialType,
    CommonNodeAttr,
    DeploymentNodeType,
    DeploymentStrategyTypeWithDefault,
    FilterConditionsListType,
    GVKType,
    MODAL_TYPE,
    OptionType,
    PipelineIdsVsDeploymentStrategyMap,
    ResponseType,
    RuntimePluginVariables,
    ServerErrors,
    UseUrlFiltersReturnType,
    WorkflowNodeType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { GitInfoMaterialProps } from '@Components/app/details/triggerView/BuildImageModal/types'
import { CDMaterialProps, RuntimeParamsErrorState } from '@Components/app/details/triggerView/types'
import {
    AppConfigState,
    EnvConfigurationsNavProps,
    EnvConfigurationState,
} from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import { EditDescRequest, Nodes, NodeType } from '../app/types'
import { WorkloadCheckType } from '../v2/appDetails/sourceInfo/scaleWorkloads/scaleWorkloadsModal.type'
import { AppFilterTabs, BulkResponseStatus } from './Constants'

interface BulkTriggerAppDetailType {
    appId: number
    name: string
    material?: any[]
    warningMessage?: string
}

export interface BulkCIDetailType extends BulkTriggerAppDetailType {
    workflowId: string
    material: CIMaterialType[]
    runtimeParams: RuntimePluginVariables[]
    node: CommonNodeAttr
    errorMessage: string
    runtimeParamsInitialError: ServerErrors | null
    materialInitialError: ServerErrors | null
    filteredCIPipelines: any
    ciConfiguredGitMaterialId: WorkflowType['ciConfiguredGitMaterialId']
    runtimeParamsErrorState: GitInfoMaterialProps['runtimeParamsErrorState']
    ignoreCache: boolean
}

export interface BulkCDDetailTypeResponse {
    bulkCDDetailType: BulkCDDetailType[]
    uniqueReleaseTags: string[]
}

export interface BulkCDDetailType
    extends BulkTriggerAppDetailType,
        Pick<CDMaterialProps, 'isTriggerBlockedDueToPlugin' | 'configurePluginURL' | 'consequence'>,
        Partial<Pick<CommonNodeAttr, 'showPluginWarning' | 'triggerBlockedInfo'>> {
    workFlowId: string
    cdPipelineName?: string
    cdPipelineId?: string
    stageType?: DeploymentNodeType
    triggerType?: string
    envName: string
    envId: number
    parentPipelineId?: string
    parentPipelineType?: WorkflowNodeType
    parentEnvironmentName?: string
    approvalConfigData?: ApprovalConfigDataType
    requestedUserId?: number
    appReleaseTags?: string[]
    tagsEditable?: boolean
    ciPipelineId?: number
    hideImageTaggingHardDelete?: boolean
    resourceFilters?: FilterConditionsListType[]
    isExceptionUser?: boolean
}

export type TriggerVirtualEnvResponseRowType =
    | {
          isVirtual: true
          helmPackageName: string
          cdWorkflowType: DeploymentNodeType
      }
    | {
          isVirtual?: never
          helmPackageName?: never
          cdWorkflowType?: DeploymentNodeType
      }

export type ResponseRowType = {
    appId: number
    appName: string
    status: BulkResponseStatus
    statusText: string
    message: string
    envId?: number
} & TriggerVirtualEnvResponseRowType

interface BulkRuntimeParamsType {
    runtimeParams: Record<string, RuntimePluginVariables[]>
    setRuntimeParams: React.Dispatch<React.SetStateAction<Record<string, RuntimePluginVariables[]>>>
    runtimeParamsErrorState: Record<string, RuntimeParamsErrorState>
    setRuntimeParamsErrorState: React.Dispatch<React.SetStateAction<Record<string, RuntimeParamsErrorState>>>
}

export interface BulkCDTriggerType extends BulkRuntimeParamsType {
    stage: DeploymentNodeType
    appList: BulkCDDetailType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any>) => void
    onClickTriggerBulkCD: (
        skipIfHibernated: boolean,
        pipelineIdVsStrategyMap: PipelineIdsVsDeploymentStrategyMap,
        appsToRetry?: Record<string, boolean>,
    ) => void
    changeTab?: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    toggleSourceInfo?: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    selectImage?: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
    ) => void
    responseList: ResponseRowType[]
    isLoading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    isVirtualEnv?: boolean
    uniqueReleaseTags: string[]
    feasiblePipelineIds: Set<number>
    bulkDeploymentStrategy: DeploymentStrategyTypeWithDefault
    setBulkDeploymentStrategy: Dispatch<SetStateAction<DeploymentStrategyTypeWithDefault>>
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

export interface TriggerResponseModalBodyProps {
    responseList: ResponseRowType[]
    isLoading: boolean
    isVirtualEnv?: boolean
}

type RetryFailedType =
    | {
          onClickRetryDeploy: BulkCDTriggerType['onClickTriggerBulkCD']
          skipHibernatedApps: boolean
          pipelineIdVsStrategyMap: PipelineIdsVsDeploymentStrategyMap
          onClickRetryBuild?: never
      }
    | {
          onClickRetryDeploy?: never
          skipHibernatedApps?: never
          pipelineIdVsStrategyMap?: never
          onClickRetryBuild: (appsToRetry: Record<string, boolean>) => void
      }

export type TriggerResponseModalFooterProps = Pick<TriggerResponseModalBodyProps, 'isLoading' | 'responseList'> & {
    closePopup: (e) => void
} & RetryFailedType

export interface TriggerModalRowType {
    rowData: ResponseRowType
    index: number
    isVirtualEnv?: boolean
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
    isVirtualEnvironment?: boolean
}

export interface EmptyEnvState {
    title?: string
    subTitle?: string
    actionHandler?: () => void
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
    envAppList: ConfigAppList[]
    envConfig: EnvConfigurationState
    fetchEnvConfig: EnvConfigurationsNavProps['fetchEnvConfig']
    appIdToAppApprovalConfigMap: AppConfigState['envIdToEnvApprovalConfigurationMap']
}

export interface AppGroupFilterConfig
    extends Pick<UseUrlFiltersReturnType<never>, 'searchKey' | 'offset' | 'pageSize'> {
    cluster: string[]
}

export interface GetEnvAppListParamsType extends Pick<AppGroupFilterConfig, 'offset'> {
    size: number
    envName: string
    clusterIds: string
}

export interface EnvironmentsListViewType
    extends Partial<Pick<UseUrlFiltersReturnType<never>, 'changePage' | 'changePageSize' | 'clearFilters'>> {
    isSuperAdmin: boolean
    filterConfig?: AppGroupFilterConfig
    appListResponse: EnvAppType
    appListLoading: boolean
}

export interface EnvironmentLinkProps {
    namespace: string
    environmentId: number
    appCount: number
    handleClusterClick: (e) => void
    environmentName: string
}

export interface AppOverridesType {
    appList?: ConfigAppList[]
    environments: any
    setEnvironments: any
}

export interface GroupFilterType {
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

export interface EnvHeaderType extends GroupFilterType {
    envName: string
    setEnvName: (label: string) => void
    setShowEmpty: (empty: boolean) => void
    showEmpty: boolean
}

export interface AppGroupAdminType {
    isSuperAdmin: boolean
}

export interface AppGroupDetailDefaultType {
    filteredAppIds: string
    appGroupListData?: AppGroupListType
    isVirtualEnv?: boolean
    envName?: string
    description?: string
    getAppListData?: () => Promise<OptionType[]>
    handleSaveDescription?: (description: string) => Promise<void>
}

interface CIPipeline {
    appName: string
    appId: number
    id: number
    parentCiPipeline: number
    parentAppId: number
    pipelineType?: string
}
export interface CIConfigListType {
    pipelineList: CIPipeline[]
    securityModuleInstalled: boolean
    blobStorageConfigured: boolean
}

export interface AppGroupAppFilterContextType {
    resourceId: string
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
    openCreateGroup: (e, groupId?: string, _edit?: boolean) => void
    openDeleteGroup: (e, groupId: string, _delete?: boolean) => void
    isSuperAdmin: boolean
    filterParentType: FilterParentType
}

export interface CreateGroupAppListType {
    id: string
    appName: string
    isSelected: boolean
}

export interface CreateTypeOfAppListType {
    id: number
    appName: string
}

export interface CreateGroupType {
    appList: CreateGroupAppListType[]
    selectedAppGroup: GroupOptionType
    unAuthorizedApps?: Map<string, boolean>
    closePopup: (e, groupId?: number) => void
    filterParentType: FilterParentType
}

export interface ApplistEnvType {
    appId: number
    appName: string
    appStatus: string
    lastDeployedTime: string
    lastDeployedBy?: string
    lastDeployedImage?: string
    commits?: string[]
    ciArtifactId?: number
}

export interface AppGroupListType {
    namespace: string
    environmentName: string
    clusterName: string
    environmentId: number
    apps: ApplistEnvType[]
    description?: string
    environmentType?: 'Non-Production' | 'Production'
    createdOn?: string
    createdBy?: string
    clusterId?: number
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

export interface CheckPermissionType {
    id?: number
    appIds: number[]
    name?: string
    description?: string
    envId?: number
    active?: boolean
}

export interface EnvGroupListResponse extends ResponseType {
    result?: EnvGroupListType[]
}

export interface EnvGroupResponse extends ResponseType {
    result?: EnvGroupListType
}

export interface CheckPermissionResponse extends ResponseType {
    result?: boolean
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

export interface EditDescRequestResponse extends ResponseType {
    result?: EditDescRequest
}

export enum FilterParentType {
    app = 'env-group',
    env = 'app-group',
}

export interface HibernateStatusRowType {
    rowData: HibernateResponseRowType
    index: number
    isHibernateOperation: boolean
    isVirtualEnv?: boolean
    hibernateInfoMap: Record<number, HibernateInfoMapProps>
}

export interface HibernateResponseRowType {
    id: number
    appName: string
    success: boolean
    authError?: boolean
    error?: string
    skipped?: string
}

export interface HibernateInfoMapProps {
    type: string
    excludedUserEmails: string[]
    userActionState: ACTION_STATE
}

type HibernateModalType = MODAL_TYPE.HIBERNATE | MODAL_TYPE.UNHIBERNATE

export interface HibernateModalProps {
    setOpenedHibernateModalType: React.Dispatch<React.SetStateAction<HibernateModalType>>
    selectedAppDetailsList: AppInfoListType | AppInfoListType[]
    appDetailsList: AppGroupListType['apps']
    envName: string
    envId: string
    setAppStatusResponseList: React.Dispatch<React.SetStateAction<any[]>>
    setShowHibernateStatusDrawer: React.Dispatch<React.SetStateAction<StatusDrawer>>
    isDeploymentWindowLoading: boolean
    showDefaultDrawer: boolean
    openedHibernateModalType: HibernateModalType
    isDeploymentBlockedViaWindow: boolean
    onClose?: () => void
}

export interface StatusDrawer {
    hibernationOperation: boolean
    showStatus: boolean
    inProgress: boolean
}

export interface ManageAppsResponse {
    appName: string
    id: number
    success: boolean
    skipped?: string
    error?: string
    authError?: boolean
}

export interface RestartWorkloadModalProps {
    selectedAppDetailsList: AppInfoListType | AppInfoListType[]
    envName: string
    envId: string
    restartLoader: boolean
    setRestartLoader: React.Dispatch<React.SetStateAction<boolean>>
    hibernateInfoMap: Record<number, HibernateInfoMapProps>
    isDeploymentBlockedViaWindow: boolean
    onClose?: () => void
}

export interface RestartStatusListDrawerProps {
    bulkRotatePodsMap: BulkRotatePodsMap
    statusModalLoading: boolean
    envName: string
    hibernateInfoMap: Record<number, HibernateInfoMapProps>
}

// ----------------------------Restart Workload DTO--------------------------------------------

export interface ResourceIdentifierDTO extends ResourceErrorMetaData {
    name: string
    namespace?: string // This is only in the post response structure and not in get api
    groupVersionKind: GVKType
}

export interface AppInfoMetaDataDTO {
    resourceMetaData: ResourceIdentifierDTO[]
    appName: string
    errorResponse?: string
}

export interface RestartPodMapDTO {
    [appId: number]: AppInfoMetaDataDTO
}

export interface WorkloadListResultDTO {
    environmentId: number
    namespace: string
    restartPodMap: RestartPodMapDTO
}

// ----------------------------Bulk Restart Data Manipulation-----------------------------------

export interface ResourceErrorMetaData {
    containsError?: boolean
    errorResponse?: string
}

export interface AppStatusMetaData {
    failedCount?: number
    successCount?: number
}

export interface ResourceMetaData extends WorkloadCheckType, ResourceErrorMetaData {
    group: string
    kind: Nodes | NodeType
    version: string
    name: string
}
export interface ResourcesMetaDataMap {
    [kindName: string]: ResourceMetaData
}
export interface BulkRotatePodsMetaData extends WorkloadCheckType, AppStatusMetaData {
    appName: string
    resources?: ResourcesMetaDataMap
    namespace: string
    errorResponse?: string
}

export interface BulkRotatePodsMap {
    [appId: number]: BulkRotatePodsMetaData
}
export interface AllExpandableDropdownTypes {
    expandedAppIds: number[]
    setExpandedAppIds: React.Dispatch<React.SetStateAction<number[]>>
    bulkRotatePodsMap: BulkRotatePodsMap
    SvgImage: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconClassName?: string
    dropdownLabel?: string
    isExpandableButtonClicked: boolean
    setExpandableButtonClicked: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ManageAppsResponseType {
    appName: string
    success: boolean
    id: string
    error: string
}

export enum AppGroupUrlFilters {
    cluster = 'cluster',
}

export interface AppGroupUrlFiltersType extends Record<AppGroupUrlFilters, string[]> {}

export interface SetFiltersInLocalStorageParamsType {
    filterParentType: FilterParentType
    resourceId: string
    resourceList: MultiValue<OptionType>
    groupList: MultiValue<GroupOptionType>
}

export type AppEnvLocalStorageKeyType = `${string}__filter`
