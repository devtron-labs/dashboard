import {
    CDMaterialResponseType,
    CDMaterialSidebarType,
    CDMaterialType,
    CommonNodeAttr,
    ConsequenceType,
    DeploymentAppTypes,
    DeploymentNodeType,
    DeploymentWindowProfileMetaData,
    ImageTaggingContainerType,
    PolicyConsequencesDTO,
    SegmentedControlProps,
    ServerErrors,
    UploadFileDTO,
    UploadFileProps,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    FilterConditionViews,
    HandleRuntimeParamChange,
    HandleRuntimeParamErrorState,
    MATERIAL_TYPE,
    RuntimeParamsErrorState,
} from '../types'

export interface DeployImageModalProps {
    appId: number
    envId: number
    appName: string
    pipelineId: number
    stageType?: DeploymentNodeType
    materialType: (typeof MATERIAL_TYPE)[keyof typeof MATERIAL_TYPE]
    handleClose: () => void
    envName: string
    showPluginWarningBeforeTrigger: boolean
    consequence: ConsequenceType
    configurePluginURL: string
    /**
     * In case of appDetails trigger re-fetch of app details
     */
    handleSuccess?: () => void
    deploymentAppType: DeploymentAppTypes
    isVirtualEnvironment: boolean
    isRedirectedFromAppDetails: boolean
    parentEnvironmentName: string
    isTriggerBlockedDueToPlugin: boolean
    triggerType: CommonNodeAttr['triggerType']
}

export type DeployImageHeaderProps = Pick<
    DeployImageModalProps,
    'handleClose' | 'stageType' | 'isVirtualEnvironment'
> & {
    envName: string
    isRollbackTrigger: boolean
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

export interface HandleTriggerErrorMessageForHelmManifestPushProps {
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
    Pick<RuntimeParamsSidebarProps, 'appName' | 'handleSidebarTabChange'> & {
        materialResponse: CDMaterialResponseType
        deploymentWindowMetadata: DeploymentWindowProfileMetaData
        policyConsequences: PolicyConsequencesDTO
        isRollbackTrigger: boolean
        // The states for material list: Can move to object
        isSearchApplied: boolean
        searchText: string
        filterView: FilterConditionViews
        showConfiguredFilters: boolean
        currentSidebarTab: CDMaterialSidebarType
        runtimeParamsErrorState: RuntimeParamsErrorState
        handleRuntimeParamsError: HandleRuntimeParamErrorState
        materialInEditModeMap: Map<number, boolean>
        onSearchTextChange: (searchText: string) => void
        onSearchApply: (searchText: string) => void
        showAppliedFilters: boolean
        handleDisableFiltersView: () => void
        handleDisableAppliedFiltersView: () => void
        appliedFilterList: CDMaterialType['appliedFilters']

        handleRuntimeParamsChange: HandleRuntimeParamChange
        handleImageSelection: (materialIndex: number) => void
        uploadRuntimeParamsFile: (props: UploadFileProps) => Promise<UploadFileDTO>
        isSecurityModuleInstalled: boolean
        handleShowAppliedFilters: (materialData: CDMaterialType) => void
        reloadMaterials: () => void
        setAppReleaseTagNames: (appReleaseTagNames: string[]) => void
        toggleCardMode: (index: number) => void
        setTagsEditable: (tagsEditable: boolean) => void
        updateCurrentAppMaterial: ImageTaggingContainerType['updateCurrentAppMaterial']
        handleEnableFiltersView: () => void
        handleFilterTabsChange: SegmentedControlProps['onChange']
        loadOlderImages: () => void
        isLoadingOlderImages: boolean
        handleAllImagesView: () => void
    } & (
        | {
              isBulkTrigger: true
          }
        | {
              isBulkTrigger?: false
          }
    )

export interface GetConsumedAndAvailableMaterialListProps
    extends Pick<DeployImageContentProps, 'isSearchApplied' | 'filterView'> {
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
        | 'isSearchApplied'
        | 'policyConsequences'
        | 'isTriggerBlockedDueToPlugin'
        | 'configurePluginURL'
        | 'envName'
        | 'materialResponse'
        | 'triggerType'
        | 'loadOlderImages'
        | 'onSearchApply'
        | 'handleAllImagesView'
    > {
    isExceptionUser: boolean
    isConsumedImagePresent: boolean
    isLoadingMore: boolean
    viewAllImages: () => void
    eligibleImagesCount: number
    handleEnableFiltersView: () => void
}
