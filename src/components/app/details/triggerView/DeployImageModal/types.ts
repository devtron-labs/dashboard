import {
    CDMaterialResponseType,
    CDMaterialSidebarType,
    CDMaterialType,
    CommonNodeAttr,
    ConsequenceType,
    DeploymentAppTypes,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    PolicyConsequencesDTO,
    SelectPickerOptionType,
    ServerErrors,
    UploadFileDTO,
    UploadFileProps,
    useSearchString,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BulkCDDetailType } from '@Components/ApplicationGroup/AppGroup.types'

import { FilterConditionViews, MATERIAL_TYPE, RuntimeParamsErrorState } from '../types'

export type DeployImageModalProps = {
    appId: number
    envId: number
    appName: string
    pipelineId: number
    stageType?: DeploymentNodeType
    materialType: (typeof MATERIAL_TYPE)[keyof typeof MATERIAL_TYPE]
    handleClose: () => void
    envName: string
    /**
     * In case of appDetails trigger re-fetch of app details
     */
    handleSuccess?: () => void
    deploymentAppType: DeploymentAppTypes
    isVirtualEnvironment: boolean
    /**
     * If opening pre/post cd make sure BE sends plugin details as well, otherwise those props will be undefined
     */
    isRedirectedFromAppDetails: boolean
    parentEnvironmentName: string
    triggerType: CommonNodeAttr['triggerType']
} & (
    | {
          showPluginWarningBeforeTrigger: boolean
          consequence: ConsequenceType
          configurePluginURL: string
          isTriggerBlockedDueToPlugin: boolean
      }
    | {
          showPluginWarningBeforeTrigger?: never
          consequence?: never
          configurePluginURL?: never
          isTriggerBlockedDueToPlugin?: never
      }
)

export type DeployImageHeaderProps = Pick<
    DeployImageModalProps,
    'handleClose' | 'stageType' | 'isVirtualEnvironment'
> & {
    envName: string
    isRollbackTrigger: boolean
    handleNavigateToMaterialListView?: () => void
    children?: React.ReactNode
    title?: string
}

export interface RuntimeParamsSidebarProps {
    areTabsDisabled: boolean
    currentSidebarTab: CDMaterialSidebarType
    handleSidebarTabChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    appName: string
}

export interface GetMaterialResponseListProps
    extends Pick<DeployImageModalProps, 'pipelineId' | 'stageType' | 'materialType' | 'appId' | 'envId'> {
    initialSearch: string
}

export interface HelmManifestErrorHandlerProps {
    serverError: ServerErrors
    searchParams: ReturnType<typeof useSearchString>['searchParams']
    redirectToDeploymentStepsPage: () => void
}

export interface GetTriggerArtifactInfoPropsType
    extends Pick<DeployImageModalProps, 'appId' | 'pipelineId'>,
        Pick<CDMaterialResponseType, 'requestedUserId'> {
    material: CDMaterialType
    showApprovalInfoTippy: boolean
    isRollbackTrigger: boolean
    isExceptionUser: boolean
    reloadMaterials: () => void
}

export interface DeployViewStateType {
    /**
     * The search text for filtering images in the deploy view, need to be in state so as to persist the search text
     */
    searchText: string
    appliedSearchText: string
    /**
     * The value of segment control to show whether we are showing eligible images or all images
     */
    filterView: FilterConditionViews
    /**
     * Show a modal to display configured image filters
     */
    showConfiguredFilters: boolean
    currentSidebarTab: CDMaterialSidebarType
    runtimeParamsErrorState: RuntimeParamsErrorState
    materialInEditModeMap: Map<number, boolean>
    /**
     * Will show filters that blocked the auto trigger
     */
    showAppliedFilters: boolean
    appliedFilterList: CDMaterialType['appliedFilters']
    isLoadingOlderImages: boolean
    showSearchBar: boolean
}

export type DeployImageContentProps = Pick<
    DeployImageModalProps,
    | 'handleClose'
    | 'pipelineId'
    | 'isRedirectedFromAppDetails'
    | 'stageType'
    | 'appId'
    | 'envId'
    | 'envName'
    | 'parentEnvironmentName'
    | 'isVirtualEnvironment'
    | 'isTriggerBlockedDueToPlugin'
    | 'configurePluginURL'
    | 'triggerType'
> &
    Pick<RuntimeParamsSidebarProps, 'appName'> & {
        materialResponse: CDMaterialResponseType
        deploymentWindowMetadata: DeploymentWindowProfileMetaData
        isRollbackTrigger: boolean
        uploadRuntimeParamsFile: (props: UploadFileProps) => Promise<UploadFileDTO>
        isSecurityModuleInstalled: boolean
        reloadMaterials: () => void
        setMaterialResponse: (
            param: (previousMaterialResponse: CDMaterialResponseType) => CDMaterialResponseType,
        ) => void
        setDeployViewState: (param: (previousDeployViewState: DeployViewStateType) => DeployViewStateType) => void
        deployViewState: DeployViewStateType
        loadOlderImages: () => void
        onSearchApply: (searchText: string) => void
    } & (
        | {
              isBulkTrigger: true
              appInfoMap: Record<number, BulkCDDetailType>
              selectedTagName: string
              handleTagChange: (tagOption: SelectPickerOptionType<string>) => void
              changeApp: (appId: number) => void
              policyConsequences?: never
          }
        | {
              isBulkTrigger?: false
              selectedTagName?: never
              appInfoMap?: never
              handleTagChange?: never
              policyConsequences: PolicyConsequencesDTO
              changeApp?: never
          }
    )

export interface GetConsumedAndAvailableMaterialListProps extends Pick<DeployViewStateType, 'filterView'> {
    isSearchApplied: boolean
    isExceptionUser: boolean
    isApprovalConfigured: boolean
    materials: CDMaterialType[]
    resourceFilters: CDMaterialResponseType['resourceFilters']
}

export interface ImageSelectionCTAProps extends Pick<DeployImageModalProps, 'appId' | 'pipelineId'> {
    material: CDMaterialType
    disableSelection: boolean
    requestedUserId: number
    reloadMaterials: () => void
    canApproverDeploy: boolean
    isExceptionUser: boolean
    handleImageSelection: (index: number) => void
}

export interface GetSequentialCDCardTitlePropsType
    extends Pick<DeployImageModalProps, 'envName' | 'parentEnvironmentName' | 'stageType' | 'isVirtualEnvironment'> {
    material: CDMaterialType
    isRollbackTrigger: boolean
    isSearchApplied: boolean
}

export interface MaterialListEmptyStateProps
    extends Pick<
        DeployImageContentProps,
        | 'isRollbackTrigger'
        | 'stageType'
        | 'appId'
        | 'policyConsequences'
        | 'isTriggerBlockedDueToPlugin'
        | 'configurePluginURL'
        | 'envName'
        | 'materialResponse'
        | 'triggerType'
        | 'loadOlderImages'
        | 'onSearchApply'
    > {
    isExceptionUser: boolean
    isConsumedImagePresent: boolean
    isLoadingMore: boolean
    viewAllImages: () => void
    eligibleImagesCount: number
    handleEnableFiltersView: () => void
    isSearchApplied: boolean
    handleAllImagesView: () => void
}

export interface BuildDeployModalProps {
    handleClose: () => void
    stageType: DeploymentNodeType
    workflows: WorkflowType[]
    isVirtualEnvironment: boolean
    envId: number
}

export type GetInitialAppListProps =
    | {
          appIdToReload: number
          searchText: string
      }
    | {
          appIdToReload?: never
          searchText?: never
      }

export interface LoadOlderImagesProps {
    materialList: CDMaterialType[]
    resourceFilters: CDMaterialResponseType['resourceFilters']
    filterView: FilterConditionViews
    stageType: DeploymentNodeType
    pipelineId: number
    /**
     * @default false
     */
    isRollbackTrigger?: boolean
    appliedSearchText?: string
}
