import { SyntheticEvent, useContext, useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import {
    API_STATUS_CODES,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CD_MATERIAL_SIDEBAR_TABS,
    CDMaterialSidebarType,
    CDMaterialType,
    CommonNodeAttr,
    ComponentSizeType,
    DEPLOYMENT_WINDOW_TYPE,
    DeploymentNodeType,
    ErrorScreenManager,
    GenericEmptyState,
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
    SelectPicker,
    SelectPickerOptionType,
    stopPropagation,
    stringComparatorBySortOrder,
    Tooltip,
    TriggerBlockType,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyPreDeploy from '@Images/empty-pre-deploy.webp'
import { BulkCDDetailType } from '@Components/ApplicationGroup/AppGroup.types'
import { BULK_CD_MESSAGING } from '@Components/ApplicationGroup/Constants'
import { importComponentFromFELibrary } from '@Components/common'

import { getIsMaterialApproved } from '../cdMaterials.utils'
import { TriggerViewContext } from '../config'
import { TRIGGER_VIEW_PARAMS } from '../Constants'
import { FilterConditionViews, HandleRuntimeParamChange, TriggerViewContextType } from '../types'
import { BULK_DEPLOY_ACTIVE_IMAGE_TAG, BULK_DEPLOY_LATEST_IMAGE_TAG } from './constants'
import ImageSelectionCTA from './ImageSelectionCTA'
import MaterialListEmptyState from './MaterialListEmptyState'
import MaterialListSkeleton from './MaterialListSkeleton'
import RuntimeParamsSidebar from './RuntimeParamsSidebar'
import { DeployImageContentProps, ImageSelectionCTAProps, RuntimeParamsSidebarProps } from './types'
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
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const TriggerBlockEmptyState = importComponentFromFELibrary('TriggerBlockEmptyState', null, 'function')
const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')
const TriggerBlockedError = importComponentFromFELibrary('TriggerBlockedError', null, 'function')

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
    appInfoMap,
    selectedTagName,
    handleTagChange,
    changeApp,
}: DeployImageContentProps) => {
    const history = useHistory()
    const { isSuperAdmin } = useMainContext()
    const { onClickApprovalNode } = useContext<TriggerViewContextType>(TriggerViewContext)

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

    const tagOptions: SelectPickerOptionType<string>[] = useMemo(() => {
        const tagNames = new Set<string>()
        Object.values(appInfoMap).forEach((app) => {
            app.materialResponse?.appReleaseTagNames?.forEach((tag) => tagNames.add(tag))
        })

        return [BULK_DEPLOY_LATEST_IMAGE_TAG, BULK_DEPLOY_ACTIVE_IMAGE_TAG].concat(
            Array.from(tagNames)
                .sort(stringComparatorBySortOrder)
                .map((tag) => ({ label: tag, value: tag })),
        )
    }, [appInfoMap])

    const selectedTagOption = useMemo(() => {
        const selectedTag = tagOptions.find((option) => option.value === selectedTagName)
        return selectedTag || { label: 'Multiple Tags', value: '' }
    }, [selectedTagName, tagOptions])

    const showRuntimeParams = !!(isBulkTrigger && RuntimeParamTabs && isPreOrPostCD)

    const getHandleAppChange = (newAppId: number) => (e: SyntheticEvent) => {
        stopPropagation(e)
        if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
            return
        }

        changeApp(newAppId)
    }

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
    const showActionBar = FilterActionBar && !isSearchApplied && !!resourceFilters?.length && !showConfiguredFilters
    const areNoMoreImagesPresent = materials.length >= materialResponse?.totalCount

    const sortedAppValues = useMemo(
        () => Object.values(appInfoMap || {}).sort((a, b) => stringComparatorBySortOrder(a.appName, b.appName)),
        [appInfoMap],
    )

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
        const updatedMaterialList = materialList.map((material, index) => ({
            ...material,
            isSelected: index === materialIndex,
        }))

        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            updatedMaterialResponse.materials = updatedMaterialList
            return updatedMaterialResponse
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
            dataTestId="cd-trigger-search-by-commit-hash"
        />
    )

    const updateCurrentAppMaterial: ImageTaggingContainerType['updateCurrentAppMaterial'] = (
        matId,
        imageReleaseTags,
        imageComment,
    ) => {
        const updatedMaterialList = materialList.map((material) => {
            if (+material.id === +matId) {
                return {
                    ...material,
                    imageReleaseTags,
                    imageComment,
                }
            }
            return material
        })

        setMaterialResponse((prevData) => {
            const updatedMaterialResponse = structuredClone(prevData)
            updatedMaterialResponse.materials = updatedMaterialList
            return updatedMaterialResponse
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

    const renderDeploymentWithoutApprovalWarning = (app: BulkCDDetailType) => {
        if (!isExceptionUser) {
            return null
        }

        const selectedMaterial: CDMaterialType = app.materialResponse?.materials?.find(
            (mat: CDMaterialType) => mat.isSelected,
        )

        if (!selectedMaterial || getIsMaterialApproved(selectedMaterial?.userApprovalMetadata)) {
            return null
        }

        return (
            <div className="flex left dc__gap-4 mb-4">
                <Icon name="ic-warning" color={null} size={14} />
                <p className="m-0 fs-12 lh-16 fw-4 cy-7">Non-approved image selected</p>
            </div>
        )
    }

    const renderAppWarningAndErrors = (app: BulkCDDetailType) => {
        const isAppSelected = app.appId === appId
        // We don't support cd for mandatory plugins
        const blockedPluginNodeType: CommonNodeAttr['type'] =
            stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

        if (app.materialError?.code === API_STATUS_CODES.UNAUTHORIZED) {
            return (
                <div className="flex left dc__gap-4">
                    <Icon name="ic-locked" color="Y500" size={12} />
                    <span className="cy-7 fw-4 fs-12 dc__truncate">{BULK_CD_MESSAGING.unauthorized.title}</span>
                </div>
            )
        }

        if (app.isTriggerBlockedDueToPlugin) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={blockedPluginNodeType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        if (app.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
            return <TriggerBlockedError stageType={stageType} />
        }

        if (!!app.warningMessage && !app.showPluginWarning) {
            return (
                <div className="flex left top dc__gap-4">
                    <Icon name="ic-warning" color={null} size={14} />
                    <span className="fw-4 fs-12 cy-7 dc__truncate">{app.warningMessage}</span>
                </div>
            )
        }

        if (app.showPluginWarning) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={blockedPluginNodeType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        return null
    }

    const renderSidebar = () => {
        if (isBulkTrigger) {
            return (
                <div className="flexbox-col h-100 dc__overflow-auto bg__primary">
                    <div className="dc__position-sticky dc__top-0 pt-12 bg__primary dc__zi-1">
                        {showRuntimeParams && (
                            <div className="px-16 pb-8">
                                <RuntimeParamTabs
                                    tabs={CD_MATERIAL_SIDEBAR_TABS}
                                    initialTab={currentSidebarTab}
                                    onChange={handleSidebarTabChange}
                                    hasError={{
                                        [CDMaterialSidebarType.PARAMETERS]:
                                            appInfoMap[+appId]?.deployViewState?.runtimeParamsErrorState &&
                                            !appInfoMap[+appId].deployViewState.runtimeParamsErrorState.isValid,
                                    }}
                                />
                            </div>
                        )}

                        {currentSidebarTab === CDMaterialSidebarType.IMAGE && (
                            <>
                                <span className="px-16">Select image by release tag</span>
                                <div className="tag-selection-dropdown px-16 pt-6 pb-12">
                                    <SelectPicker
                                        name="bulk-cd-trigger__select-tag"
                                        inputId="bulk-cd-trigger__select-tag"
                                        isSearchable
                                        options={tagOptions}
                                        value={selectedTagOption}
                                        icon={<Icon name="ic-tag" size={16} color={null} />}
                                        onChange={handleTagChange}
                                        isDisabled={false}
                                        // Not changing it for backward compatibility for automation
                                        classNamePrefix="build-config__select-repository-containing-code"
                                        autoFocus
                                    />
                                </div>
                            </>
                        )}
                        <div className="dc__border-bottom py-8 px-16 w-100">
                            <span className="fw-6 fs-13 cn-7">APPLICATIONS</span>
                        </div>
                    </div>

                    {sortedAppValues.map((appDetails) => (
                        <div
                            key={`app-${appDetails.appId}`}
                            className={`p-16 dc__border-bottom-n1 cursor w-100 dc__tab-focus ${
                                appDetails.appId === appId ? 'bg__tertiary' : ''
                            }`}
                            role="button"
                            tabIndex={0}
                            onClick={getHandleAppChange(appDetails.appId)}
                        >
                            <Tooltip content={appDetails.appName}>
                                <span className="lh-20 cn-9 fw-6 fs-13 dc__truncate">{appDetails.appName}</span>
                            </Tooltip>
                            {renderDeploymentWithoutApprovalWarning(appDetails)}
                            {renderAppWarningAndErrors(appDetails)}
                        </div>
                    ))}
                </div>
            )
        }

        if (isPreOrPostCD) {
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

    const renderEmptyView = (): JSX.Element => {
        const selectedApp = appInfoMap[+appId]

        if (selectedApp.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
            return <TriggerBlockEmptyState stageType={stageType} appId={appId} />
        }

        if (isTriggerBlockedDueToPlugin) {
            // It can't be CD
            const commonNodeAttrType: CommonNodeAttr['type'] =
                stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

            return (
                <MissingPluginBlockState
                    configurePluginURL={selectedApp?.configurePluginURL}
                    nodeType={commonNodeAttrType}
                />
            )
        }

        if (selectedApp.materialError) {
            return (
                <ErrorScreenManager
                    code={selectedApp.materialError.code}
                    reload={reloadMaterials}
                    on404Redirect={handleClose}
                />
            )
        }

        return (
            <GenericEmptyState
                image={emptyPreDeploy}
                title={`${selectedApp?.appName} ${BULK_CD_MESSAGING[stageType].title}`}
                subTitle={BULK_CD_MESSAGING[stageType].subTitle}
            />
        )
    }

    const renderContent = () => {
        if (isBulkTrigger) {
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
                return renderEmptyView()
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

                        <span className="flexbox dc__align-items-center h-32 dc__gap-4">
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
                            handleEnableFiltersView={handleShowConfiguredFilters}
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

    if (ConfiguredFilters && (showConfiguredFilters || showAppliedFilters)) {
        return (
            <ConfiguredFilters
                isFromBulkCD={isBulkTrigger}
                resourceFilters={showConfiguredFilters ? resourceFilters : appliedFilterList}
                handleDisableFiltersView={
                    showConfiguredFilters ? handleExitFiltersView : handleDisableAppliedFiltersView
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
                className={`flex-grow-1 dc__overflow-auto h-100 ${isPreOrPostCD || isBulkTrigger ? 'display-grid cd-material__container-with-sidebar' : 'flexbox-col flex-grow-1 py-16 px-20'}`}
            >
                {renderSidebar()}
                <div className="flexbox-col py-16 px-20 dc__overflow-auto">{renderContent()}</div>
            </div>
        </>
    )
}

export default DeployImageContent
