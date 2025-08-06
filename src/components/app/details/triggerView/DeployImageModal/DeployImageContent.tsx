import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CDMaterialSidebarType,
    CDMaterialType,
    ComponentSizeType,
    DEPLOYMENT_WINDOW_TYPE,
    DeploymentNodeType,
    getGitCommitInfo,
    getIsApprovalPolicyConfigured,
    getIsMaterialInfoAvailable,
    GitCommitInfoGeneric,
    handleUTCTime,
    Icon,
    ImageCard,
    ImageCardAccordion,
    ImageTaggingContainerType,
    InfoBlock,
    isNullOrUndefined,
    MaterialInfo,
    Progressing,
    SearchBar,
    SegmentedControlProps,
    TriggerBlockType,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { TRIGGER_VIEW_PARAMS } from '../Constants'
import { FilterConditionViews, HandleRuntimeParamChange } from '../types'
import BulkDeployEmptyState from './BulkDeployEmptyState'
import BulkTriggerSidebar from './BulkTriggerSidebar'
import ImageSelectionCTA from './ImageSelectionCTA'
import MaterialListEmptyState from './MaterialListEmptyState'
import MaterialListSkeleton from './MaterialListSkeleton'
import RuntimeParamsSidebar from './RuntimeParamsSidebar'
import { DeployImageContentProps, ImageSelectionCTAProps, RuntimeParamsSidebarProps } from './types'
import {
    getApprovedImageClass,
    getConsumedAndAvailableMaterialList,
    getFilterActionBarTabs,
    getIsConsumedImageAvailable,
    getIsExceptionUser,
    getIsImageApprover,
    getSequentialCDCardTitleProps,
    getTriggerArtifactInfoProps,
} from './utils'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const ApprovedImagesMessage = importComponentFromFELibrary('ApprovedImagesMessage')
const MaintenanceWindowInfoBar = importComponentFromFELibrary('MaintenanceWindowInfoBar')
const FilterActionBar = importComponentFromFELibrary('FilterActionBar')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')
const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')
const CDMaterialInfo = importComponentFromFELibrary('CDMaterialInfo')
const ConfiguredFilters = importComponentFromFELibrary('ConfiguredFilters')

const DeployImageContent = ({
    appId,
    envId,
    materialResponse,
    isRollbackTrigger,
    isTriggerBlockedDueToPlugin,
    configurePluginURL,
    isBulkTrigger,
    deploymentWindowMetadata,
    pipelineId,
    handleClose,
    isRedirectedFromAppDetails,
    onSearchApply,
    stageType,
    uploadRuntimeParamsFile,
    appName,
    isSecurityModuleInstalled,
    envName,
    reloadMaterials,
    parentEnvironmentName,
    isVirtualEnvironment,
    loadOlderImages,
    policyConsequences,
    triggerType,
    deployViewState,
    setDeployViewState,
    setMaterialResponse,
    appInfoMap = {},
    selectedTagName,
    handleTagChange,
    changeApp,
    onClickApprovalNode,
}: DeployImageContentProps) => {
    // WARNING: Pls try not to create a useState in this component, it is supposed to be a dumb component.
    const history = useHistory()
    const { isSuperAdmin } = useMainContext()

    // Assumption: isExceptionUser is a global trait
    const isExceptionUser = getIsExceptionUser(materialResponse)
    const requestedUserId = materialResponse?.requestedUserId
    const isApprovalConfigured = getIsApprovalPolicyConfigured(
        materialResponse?.deploymentApprovalInfo?.approvalConfigData,
    )
    const materials = materialResponse?.materials || []
    const canApproverDeploy = materialResponse?.canApproverDeploy ?? false
    const resourceFilters = materialResponse?.resourceFilters ?? []
    const hideImageTaggingHardDelete = materialResponse?.hideImageTaggingHardDelete ?? false
    const runtimeParamsList = materialResponse?.runtimeParams || []
    const isConsumedImageAvailable = getIsConsumedImageAvailable(materials)
    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD
    const isCDNode = stageType === DeploymentNodeType.CD

    const {
        searchText,
        appliedSearchText,
        filterView,
        showConfiguredFilters,
        currentSidebarTab,
        runtimeParamsErrorState,
        materialInEditModeMap,
        showAppliedFilters,
        appliedFilterList,
        isLoadingOlderImages,
        showSearchBar,
    } = deployViewState

    const isSearchApplied = !!appliedSearchText

    const { consumedImage, materialList, eligibleImagesCount } = getConsumedAndAvailableMaterialList({
        isApprovalConfigured,
        isExceptionUser,
        materials,
        isSearchApplied,
        filterView,
        resourceFilters,
    })
    const selectImageTitle = isRollbackTrigger ? 'Select from previously deployed images' : 'Select Image'
    const titleText = isApprovalConfigured && !isExceptionUser ? 'Approved images' : selectImageTitle
    const showActionBar = !!FilterActionBar && !isSearchApplied && !!resourceFilters?.length && !showConfiguredFilters
    const areNoMoreImagesPresent = materials.length >= materialResponse?.totalCount

    const showFiltersView = !!(ConfiguredFilters && (showConfiguredFilters || showAppliedFilters))

    const handleSidebarTabChange: RuntimeParamsSidebarProps['handleSidebarTabChange'] = (e) => {
        setDeployViewState((prevState) => ({
            ...prevState,
            currentSidebarTab: e.target.value as CDMaterialSidebarType,
        }))
    }

    const onSearchTextChange = (newSearchText: string) => {
        setDeployViewState((prevState) => ({
            ...prevState,
            searchText: newSearchText,
        }))
    }

    const handleAllImagesView = () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            filterView: FilterConditionViews.ALL,
        }))
    }

    const handleFilterTabsChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        const { value } = selectedSegment
        setDeployViewState((prevState) => ({
            ...prevState,
            filterView: value as FilterConditionViews,
        }))
    }

    const handleShowConfiguredFilters = () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            showConfiguredFilters: true,
        }))
    }

    const handleExitFiltersView = () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            showConfiguredFilters: false,
        }))
    }

    const handleDisableAppliedFiltersView = () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            appliedFilterList: [],
            showAppliedFilters: false,
        }))
    }

    const getHandleShowAppliedFilters = (materialData: CDMaterialType) => () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            appliedFilterList: materialData?.appliedFilters ?? [],
            showAppliedFilters: true,
        }))
    }

    const handleShowSearchBar = () => {
        setDeployViewState((prevState) => ({
            ...prevState,
            showSearchBar: true,
        }))
    }

    const handleImageSelection: ImageSelectionCTAProps['handleImageSelection'] = (materialIndex) => {
        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            return {
                ...updatedMaterialResponse,
                materials: updatedMaterialResponse.materials.map((material, index) => ({
                    ...material,
                    isSelected: index === materialIndex,
                })),
            }
        })
    }

    const setAppReleaseTagNames: ImageTaggingContainerType['setAppReleaseTagNames'] = (appReleaseTagNames) => {
        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            updatedMaterialResponse.appReleaseTagNames = appReleaseTagNames
            return updatedMaterialResponse
        })
    }

    const viewAllImages = () => {
        if (isRedirectedFromAppDetails) {
            history.push({
                search: `${TRIGGER_VIEW_PARAMS.APPROVAL_NODE}=${pipelineId}&${TRIGGER_VIEW_PARAMS.APPROVAL_STATE}=${TRIGGER_VIEW_PARAMS.APPROVAL}`,
            })
        } else {
            handleClose()
            onClickApprovalNode(pipelineId)
        }
    }

    const renderSearch = () => (
        <SearchBar
            initialSearchText={searchText}
            handleEnter={onSearchApply}
            handleSearchChange={onSearchTextChange}
            containerClassName="w-250"
            inputProps={{
                placeholder: 'Search by image tag',
                autoFocus: true,
            }}
            dataTestId="cd-trigger-search-by-image-tag"
        />
    )

    const updateCurrentAppMaterial: ImageTaggingContainerType['updateCurrentAppMaterial'] = (
        matId,
        imageReleaseTags,
        imageComment,
    ) => {
        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            return {
                ...updatedMaterialResponse,
                materials: updatedMaterialResponse.materials.map((material) => {
                    if (+material.id === +matId) {
                        return {
                            ...material,
                            imageReleaseTags,
                            imageComment,
                        }
                    }
                    return material
                }),
            }
        })
    }

    const setTagsEditable: ImageTaggingContainerType['setTagsEditable'] = (tagsEditable) => {
        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            updatedMaterialResponse.tagsEditable = tagsEditable
            return updatedMaterialResponse
        })
    }

    const handleRuntimeParamsChange: HandleRuntimeParamChange = (updatedRuntimeParamsList) => {
        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            updatedMaterialResponse.runtimeParams = updatedRuntimeParamsList
            return updatedMaterialResponse
        })
    }

    const handleRuntimeParamsError = (updatedRuntimeParamsErrorState: typeof runtimeParamsErrorState) => {
        setDeployViewState((prevState) => ({
            ...prevState,
            runtimeParamsErrorState: updatedRuntimeParamsErrorState,
        }))
    }

    const toggleCardMode: ImageTaggingContainerType['toggleCardMode'] = (index: number) => {
        setDeployViewState((prevState) => {
            const newMaterialInEditModeMap = new Map(prevState.materialInEditModeMap)
            newMaterialInEditModeMap.set(index, !newMaterialInEditModeMap.get(index))
            return {
                ...prevState,
                materialInEditModeMap: newMaterialInEditModeMap,
            }
        })
    }

    const getImageTagContainerProps = (mat: CDMaterialType): ImageTaggingContainerType => ({
        ciPipelineId: null,
        artifactId: +mat.id,
        imageComment: mat.imageComment,
        imageReleaseTags: mat.imageReleaseTags,
        appReleaseTagNames: materialResponse?.appReleaseTagNames,
        setAppReleaseTagNames,
        tagsEditable: materialResponse?.tagsEditable,
        toggleCardMode,
        setTagsEditable,
        updateCurrentAppMaterial,
        forceReInit: true,
        hideHardDelete: hideImageTaggingHardDelete,
        isSuperAdmin,
    })

    const renderSidebar = () => {
        if (isBulkTrigger) {
            return (
                <BulkTriggerSidebar
                    appId={appId}
                    stageType={stageType}
                    appInfoMap={appInfoMap}
                    selectedTagName={selectedTagName}
                    handleTagChange={handleTagChange}
                    changeApp={changeApp}
                    handleSidebarTabChange={handleSidebarTabChange}
                    currentSidebarTab={currentSidebarTab}
                />
            )
        }

        if (isPreOrPostCD && !showFiltersView) {
            return (
                <RuntimeParamsSidebar
                    areTabsDisabled={false}
                    currentSidebarTab={currentSidebarTab}
                    handleSidebarTabChange={handleSidebarTabChange}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    appName={appName}
                />
            )
        }

        return null
    }

    const renderConfiguredFilters = () => (
        <ConfiguredFilters
            isFromBulkCD={isBulkTrigger}
            resourceFilters={showConfiguredFilters ? resourceFilters : appliedFilterList}
            handleDisableFiltersView={showConfiguredFilters ? handleExitFiltersView : handleDisableAppliedFiltersView}
            envName={envName}
            closeModal={handleClose}
        />
    )

    const renderGitMaterialInfo = (materialData: CDMaterialType) => (
        <>
            {materialData.materialInfo.map((mat: MaterialInfo, index) => {
                const _gitCommit = getGitCommitInfo(mat)

                if (
                    CDMaterialInfo &&
                    (materialData.appliedFilters?.length > 0 ||
                        materialData.deploymentBlockedState?.isBlocked ||
                        materialData.deploymentWindowArtifactMetadata?.type)
                ) {
                    return (
                        <CDMaterialInfo
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            commitTimestamp={handleUTCTime(materialData.createdTime)}
                            appliedFiltersTimestamp={handleUTCTime(materialData.appliedFiltersTimestamp)}
                            envName={envName}
                            // Should not use Arrow function here but seems like no choice
                            showConfiguredFilters={getHandleShowAppliedFilters(materialData)}
                            filterState={materialData.appliedFiltersState}
                            dataSource={materialData.dataSource}
                            deploymentWindowArtifactMetadata={materialData.deploymentWindowArtifactMetadata}
                            isFilterApplied={materialData.appliedFilters?.length > 0}
                            triggerBlockedInfo={materialData.deploymentBlockedState}
                        >
                            {(_gitCommit.WebhookData?.Data ||
                                _gitCommit.Author ||
                                _gitCommit.Message ||
                                _gitCommit.Date ||
                                _gitCommit.Commit) && (
                                <GitCommitInfoGeneric
                                    index={index}
                                    materialUrl={mat.url}
                                    showMaterialInfoHeader
                                    commitInfo={_gitCommit}
                                    materialSourceType={mat.type}
                                    selectedCommitInfo=""
                                    materialSourceValue={mat.branch}
                                />
                            )}
                        </CDMaterialInfo>
                    )
                }

                return (
                    (_gitCommit.WebhookData?.Data ||
                        _gitCommit.Author ||
                        _gitCommit.Message ||
                        _gitCommit.Date ||
                        _gitCommit.Commit) && (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={index} className="bg__primary br-4 en-2 bw-1 m-12">
                            <GitCommitInfoGeneric
                                index={index}
                                materialUrl={mat.url}
                                showMaterialInfoHeader
                                commitInfo={_gitCommit}
                                materialSourceType={mat.type}
                                selectedCommitInfo=""
                                materialSourceValue={mat.branch}
                            />
                        </div>
                    )
                )
            })}
        </>
    )

    const renderMaterialList = (materialsToRender: typeof materialList, disableSelection: boolean) =>
        materialsToRender.map((mat) => {
            const isMaterialInfoAvailable = getIsMaterialInfoAvailable(mat.materialInfo)
            const approvedImageClass = getApprovedImageClass(disableSelection, isApprovalConfigured)
            const isImageApprover = getIsImageApprover(mat.userApprovalMetadata)

            const hideSourceInfo = !materialInEditModeMap.get(+mat.id)

            const showApprovalInfoTippy =
                !disableSelection &&
                (isCDNode || isRollbackTrigger) &&
                isApprovalConfigured &&
                ApprovalInfoTippy &&
                !isNullOrUndefined(mat.userApprovalMetadata.approvalRuntimeState)

            const imageCardRootClassName =
                mat.isSelected && !disableSelection && !isImageApprover ? 'material-history-selected' : ''

            return (
                <ImageCard
                    testIdLocator={String(mat.index)}
                    cta={
                        <ImageSelectionCTA
                            material={mat}
                            disableSelection={disableSelection}
                            requestedUserId={requestedUserId}
                            reloadMaterials={reloadMaterials}
                            appId={appId}
                            pipelineId={pipelineId}
                            canApproverDeploy={canApproverDeploy}
                            isExceptionUser={isExceptionUser}
                            handleImageSelection={handleImageSelection}
                        />
                    }
                    sequentialCDCardTitleProps={getSequentialCDCardTitleProps({
                        material: mat,
                        envName,
                        parentEnvironmentName,
                        stageType,
                        isVirtualEnvironment,
                        isRollbackTrigger,
                        isSearchApplied,
                    })}
                    artifactInfoProps={getTriggerArtifactInfoProps({
                        material: mat,
                        showApprovalInfoTippy,
                        isRollbackTrigger,
                        appId,
                        pipelineId,
                        isExceptionUser,
                        reloadMaterials,
                        requestedUserId,
                    })}
                    imageTagContainerProps={getImageTagContainerProps(mat)}
                    rootClassName={imageCardRootClassName}
                    materialInfoRootClassName={approvedImageClass}
                    key={`material-history-${mat.index}`}
                >
                    {mat.materialInfo.length > 0 &&
                        (isMaterialInfoAvailable || mat.appliedFilters?.length) &&
                        hideSourceInfo && (
                            <ImageCardAccordion
                                environmentId={envId}
                                isSecurityModuleInstalled={isSecurityModuleInstalled}
                                artifactId={+mat.id}
                                applicationId={appId}
                                changesCard={renderGitMaterialInfo(mat)}
                                isScanned={mat.scanned}
                                isScanEnabled={mat.scanEnabled}
                                SecurityModalSidebar={SecurityModalSidebar}
                            />
                        )}
                </ImageCard>
            )
        })

    const renderContent = () => {
        if (isBulkTrigger) {
            if (showFiltersView) {
                return renderConfiguredFilters()
            }

            const { areMaterialsLoading, triggerBlockedInfo, materialError } = appInfoMap[+appId] || {}
            if (currentSidebarTab === CDMaterialSidebarType.IMAGE && areMaterialsLoading) {
                return <MaterialListSkeleton />
            }

            const selectedApp = appInfoMap[+appId]

            if (
                triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG ||
                isTriggerBlockedDueToPlugin ||
                materialError ||
                selectedApp?.stageNotAvailable
            ) {
                return (
                    <BulkDeployEmptyState
                        selectedApp={selectedApp}
                        stageType={stageType}
                        appId={appId}
                        isTriggerBlockedDueToPlugin={isTriggerBlockedDueToPlugin}
                        handleClose={handleClose}
                        reloadMaterials={reloadMaterials}
                    />
                )
            }
        }

        if (currentSidebarTab === CDMaterialSidebarType.IMAGE || !RuntimeParameters) {
            return (
                <>
                    {isApprovalConfigured && renderMaterialList(consumedImage, true)}

                    <div className="material-list__title pb-16 flex dc__align-center dc__content-space">
                        {showActionBar ? (
                            <FilterActionBar
                                tabs={getFilterActionBarTabs(
                                    materials.length,
                                    eligibleImagesCount,
                                    consumedImage.length,
                                )}
                                onChange={handleFilterTabsChange}
                                handleEnableFiltersView={handleShowConfiguredFilters}
                                initialTab={filterView}
                            />
                        ) : (
                            <span className="flex dc__align-start">{titleText}</span>
                        )}

                        <div className="flexbox dc__align-items-center h-32 dc__gap-4">
                            {showSearchBar || isSearchApplied ? (
                                renderSearch()
                            ) : (
                                <Button
                                    dataTestId="deploy-image-show-search-button"
                                    variant={ButtonVariantType.borderLess}
                                    style={ButtonStyleType.neutral}
                                    onClick={handleShowSearchBar}
                                    icon={<Icon name="ic-magnifying-glass" color={null} />}
                                    ariaLabel="Show search bar"
                                    showAriaLabelInTippy={false}
                                    size={ComponentSizeType.small}
                                />
                            )}
                            <Button
                                dataTestId="refresh-materials-button"
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.neutral}
                                onClick={reloadMaterials}
                                icon={<Icon name="ic-arrows-clockwise" color={null} />}
                                ariaLabel="Refresh material list"
                                showAriaLabelInTippy={false}
                                size={ComponentSizeType.small}
                            />
                        </div>
                    </div>

                    {materialList.length === 0 ? (
                        <div className="flexbox-col flex-grow-1 dc__overflow-auto h-100">
                            <MaterialListEmptyState
                                isRollbackTrigger={isRollbackTrigger}
                                stageType={stageType}
                                appId={appId}
                                isSearchApplied={isSearchApplied}
                                policyConsequences={policyConsequences}
                                isTriggerBlockedDueToPlugin={isTriggerBlockedDueToPlugin}
                                configurePluginURL={configurePluginURL}
                                isConsumedImagePresent={consumedImage.length > 0}
                                envName={envName}
                                materialResponse={materialResponse}
                                isExceptionUser={isExceptionUser}
                                isLoadingMore={isLoadingOlderImages}
                                viewAllImages={viewAllImages}
                                triggerType={triggerType}
                                loadOlderImages={loadOlderImages}
                                onSearchApply={onSearchApply}
                                eligibleImagesCount={eligibleImagesCount}
                                handleEnableFiltersView={handleShowConfiguredFilters}
                                handleAllImagesView={handleAllImagesView}
                            />
                        </div>
                    ) : (
                        renderMaterialList(materialList, false)
                    )}

                    {!areNoMoreImagesPresent && !!materialList?.length && (
                        <button
                            className="show-older-images-cta cta ghosted flex h-32"
                            onClick={loadOlderImages}
                            type="button"
                        >
                            {isLoadingOlderImages ? <Progressing styles={{ height: '32px' }} /> : 'Fetch more images'}
                        </button>
                    )}
                </>
            )
        }

        return (
            <div className="bg__tertiary dc__overflow-auto flex-grow-1">
                <RuntimeParameters
                    appId={appId}
                    parameters={runtimeParamsList}
                    handleChange={handleRuntimeParamsChange}
                    errorState={runtimeParamsErrorState}
                    handleError={handleRuntimeParamsError}
                    uploadFile={uploadRuntimeParamsFile}
                    isCD
                />
            </div>
        )
    }

    if (showFiltersView && !isBulkTrigger) {
        return renderConfiguredFilters()
    }

    return (
        <>
            {!showFiltersView &&
                isApprovalConfigured &&
                !isExceptionUser &&
                ApprovedImagesMessage &&
                (isRollbackTrigger || materials.length - Number(isConsumedImageAvailable) > 0) && (
                    <InfoBlock
                        borderConfig={{ top: false }}
                        borderRadiusConfig={{ top: false, bottom: false, left: false, right: false }}
                        description={<ApprovedImagesMessage viewAllImages={viewAllImages} />}
                    />
                )}
            {!showFiltersView &&
                !isBulkTrigger &&
                MaintenanceWindowInfoBar &&
                deploymentWindowMetadata.type === DEPLOYMENT_WINDOW_TYPE.MAINTENANCE &&
                deploymentWindowMetadata.isActive && (
                    <MaintenanceWindowInfoBar
                        windowName={deploymentWindowMetadata.name}
                        endTime={deploymentWindowMetadata.calculatedTimestamp}
                    />
                )}

            <div
                className={`flex-grow-1 dc__overflow-auto h-100 ${isPreOrPostCD || isBulkTrigger ? 'display-grid cd-material__container-with-sidebar' : 'flexbox-col flex-grow-1'}`}
            >
                {renderSidebar()}
                <div className="flexbox-col py-16 px-20 dc__overflow-auto flex-grow-1">{renderContent()}</div>
            </div>
        </>
    )
}

export default DeployImageContent
