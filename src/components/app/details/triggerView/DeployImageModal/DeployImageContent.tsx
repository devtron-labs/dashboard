import { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CDMaterialSidebarType,
    CDMaterialType,
    ConditionalWrap,
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
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { TriggerViewContext } from '../config'
import { TRIGGER_VIEW_PARAMS } from '../Constants'
import { TriggerViewContextType } from '../types'
import ImageSelectionCTA from './ImageSelectionCTA'
import MaterialListEmptyState from './MaterialListEmptyState'
import RuntimeParamsSidebar from './RuntimeParamsSidebar'
import { DeployImageContentProps } from './types'
import {
    getApprovedImageClass,
    getConsumedAndAvailableMaterialList,
    getFilterActionBarTabs,
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

const renderMaterialListBodyWrapper = (children: JSX.Element) => (
    <div className="flexbox-col py-16 px-20 dc__overflow-auto">{children}</div>
)

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
    isSearchApplied,
    searchText,
    onSearchApply,
    onSearchTextChange,
    filterView,
    showConfiguredFilters,
    stageType,
    currentSidebarTab,
    handleRuntimeParamsChange,
    runtimeParamsErrorState,
    handleRuntimeParamsError,
    uploadRuntimeParamsFile,
    handleSidebarTabChange,
    appName,
    materialInEditModeMap,
    isSecurityModuleInstalled,
    envName,
    handleShowAppliedFilters,
    reloadMaterials,
    parentEnvironmentName,
    isVirtualEnvironment,
    handleImageSelection,
    setAppReleaseTagNames,
    toggleCardMode,
    setTagsEditable,
    updateCurrentAppMaterial,
    handleEnableFiltersView,
    handleFilterTabsChange,
    loadOlderImages,
    isLoadingOlderImages,
    policyConsequences,
    handleAllImagesView,
    showAppliedFilters,
    handleDisableFiltersView,
    handleDisableAppliedFiltersView,
    triggerType,
    appliedFilterList,
}: DeployImageContentProps) => {
    const history = useHistory()
    const { isSuperAdmin } = useMainContext()

    const { onClickApprovalNode } = useContext<TriggerViewContextType>(TriggerViewContext)

    const [showSearchBar, setShowSearchBar] = useState<boolean>(false)

    const isExceptionUser = materialResponse?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false
    const requestedUserId = materialResponse?.requestedUserId
    const isApprovalConfigured = getIsApprovalPolicyConfigured(
        materialResponse?.deploymentApprovalInfo?.approvalConfigData,
    )
    const materials = materialResponse?.materials || []
    const canApproverDeploy = materialResponse?.canApproverDeploy ?? false
    const resourceFilters = materialResponse?.resourceFilters ?? []
    const hideImageTaggingHardDelete = materialResponse?.hideImageTaggingHardDelete ?? false
    const isConsumedImageAvailable =
        materials.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false
    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD
    const runtimeParamsList = materialResponse?.runtimeParams || []
    const isCDNode = stageType === DeploymentNodeType.CD

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
    const showActionBar = FilterActionBar && !isSearchApplied && !!resourceFilters?.length && !showConfiguredFilters
    const areNoMoreImagesPresent = materials.length >= materialResponse?.totalCount

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

    const handleShowSearchBar = () => {
        setShowSearchBar(true)
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
            dataTestId="cd-trigger-search-by-commit-hash"
        />
    )

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
            // TODO: Implement bulk trigger sidebar
            return null
        }

        if (isPreOrPostCD) {
            return (
                <RuntimeParamsSidebar
                    areTabsDisabled
                    currentSidebarTab={currentSidebarTab}
                    handleSidebarTabChange={handleSidebarTabChange}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    appName={appName}
                />
            )
        }

        return null
    }

    const renderGitMaterialInfo = (materialData: CDMaterialType) => (
        <>
            {materialData.materialInfo.map((mat: MaterialInfo, index) => {
                const _gitCommit = getGitCommitInfo(mat)

                if (
                    (materialData.appliedFilters?.length > 0 ||
                        materialData.deploymentBlockedState?.isBlocked ||
                        materialData.deploymentWindowArtifactMetadata?.type) &&
                    CDMaterialInfo
                ) {
                    return (
                        <CDMaterialInfo
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            commitTimestamp={handleUTCTime(materialData.createdTime)}
                            appliedFiltersTimestamp={handleUTCTime(materialData.appliedFiltersTimestamp)}
                            envName={envName}
                            // Should not use Arrow function here but seems like no choice
                            showConfiguredFilters={() => handleShowAppliedFilters(materialData)}
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

    if (ConfiguredFilters && (showConfiguredFilters || showAppliedFilters)) {
        return (
            <ConfiguredFilters
                isFromBulkCD={isBulkTrigger}
                resourceFilters={showConfiguredFilters ? resourceFilters : appliedFilterList}
                handleDisableFiltersView={
                    showConfiguredFilters ? handleDisableFiltersView : handleDisableAppliedFiltersView
                }
                envName={envName}
                closeModal={handleClose}
            />
        )
    }

    return (
        <>
            {isApprovalConfigured &&
                !isExceptionUser &&
                ApprovedImagesMessage &&
                (isRollbackTrigger || materials.length - Number(isConsumedImageAvailable) > 0) && (
                    <InfoBlock
                        borderConfig={{ top: false }}
                        borderRadiusConfig={{ top: false, bottom: false, left: false, right: false }}
                        // TODO: Look if need to show this in bulk?
                        description={<ApprovedImagesMessage viewAllImages={viewAllImages} />}
                    />
                )}
            {!isBulkTrigger &&
                MaintenanceWindowInfoBar &&
                deploymentWindowMetadata.type === DEPLOYMENT_WINDOW_TYPE.MAINTENANCE &&
                deploymentWindowMetadata.isActive && (
                    <MaintenanceWindowInfoBar
                        windowName={deploymentWindowMetadata.name}
                        endTime={deploymentWindowMetadata.calculatedTimestamp}
                    />
                )}

            <div
                className={`flex-grow-1 dc__overflow-auto ${isPreOrPostCD && !isBulkTrigger ? 'display-grid cd-material__container-with-sidebar' : 'flexbox-col py-16 px-20'}`}
            >
                {renderSidebar()}

                <ConditionalWrap condition={isPreOrPostCD && !isBulkTrigger} wrap={renderMaterialListBodyWrapper}>
                    {currentSidebarTab === CDMaterialSidebarType.IMAGE || !RuntimeParameters ? (
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
                                        handleEnableFiltersView={handleEnableFiltersView}
                                        initialTab={filterView}
                                    />
                                ) : (
                                    <span className="flex dc__align-start">{titleText}</span>
                                )}

                                <span className="flexbox dc__align-items-center h-32 dc__gap-16">
                                    {showSearchBar ? (
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
                                    />
                                </span>
                            </div>

                            {materialList.length === 0 ? (
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
                                    // TODO: Move to util and remove prop
                                    isExceptionUser={isExceptionUser}
                                    isLoadingMore={isLoadingOlderImages}
                                    viewAllImages={viewAllImages}
                                    triggerType={triggerType}
                                    loadOlderImages={loadOlderImages}
                                    onSearchApply={onSearchApply}
                                    eligibleImagesCount={eligibleImagesCount}
                                    handleEnableFiltersView={handleEnableFiltersView}
                                    handleAllImagesView={handleAllImagesView}
                                />
                            ) : (
                                renderMaterialList(materialList, false)
                            )}

                            {!areNoMoreImagesPresent && !!materialList?.length && (
                                <button
                                    className="show-older-images-cta cta ghosted flex h-32"
                                    onClick={loadOlderImages}
                                    type="button"
                                >
                                    {isLoadingOlderImages ? (
                                        <Progressing styles={{ height: '32px' }} />
                                    ) : (
                                        'Fetch more images'
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
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
                    )}
                </ConditionalWrap>
            </div>
        </>
    )
}

export default DeployImageContent
