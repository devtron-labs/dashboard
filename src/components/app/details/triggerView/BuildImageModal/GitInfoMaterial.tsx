import { useState } from 'react'

import {
    ActionMenu,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CIMaterialSidebarType,
    CIMaterialType,
    CiPipelineSourceConfig,
    ComponentSizeType,
    ConditionalWrap,
    createGitCommitUrl,
    ErrorScreenManager,
    GenericEmptyState,
    getHandleOpenURL,
    handleUTCTime,
    Icon,
    MaterialHistory,
    OptionType,
    SearchBar,
    showError,
    SourceTypeMap,
    Tooltip,
    uploadCIPipelineFile,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import externalCiImg from '@Images/external-ci.webp'
import linkedCDBuildCIImg from '@Images/linked-cd-bulk-ci.webp'
import linkedCiImg from '@Images/linked-ci.webp'
import { getCIMaterialList, getGitMaterialByCommitHash, refreshGitMaterial } from '@Components/app/service'
import { BULK_CI_MESSAGING } from '@Components/ApplicationGroup/Constants'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { NO_COMMIT_SELECTED } from '@Config/constants'
import { URLS } from '@Config/routes'

import { EmptyView } from '../../cicdHistory/History.components'
import BranchRegexModal from '../BranchRegexModal'
import { CiWebhookModal } from '../CiWebhookDebuggingModal'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from '../Constants'
import EmptyStateCIMaterial from '../EmptyStateCIMaterial'
import TriggerBuildSidebar from './TriggerBuildSidebar'
import { GitInfoMaterialProps } from './types'
import { getIsRegexBranchNotAvailable } from './utils'

import './GitInfoMaterial.scss'

const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')

const GitInfoMaterial = ({
    appId,
    workflowId,
    node,
    isJobView,
    setMaterialList,
    runtimeParamsErrorState,
    materialList,
    showWebhookModal,
    reloadCompleteMaterialList,
    handleRuntimeParamChange,
    handleRuntimeParamError,
    selectedEnv,
    runtimeParams,
    handleDisplayWebhookModal,
    selectedCIPipeline,
    handleReloadWithWorkflows,
    isBulkTrigger = false,
    appList,
    handleAppChange: handleAppChangeProp,
    isBlobStorageConfigured,
    toggleSelectedAppIgnoreCache,
}: GitInfoMaterialProps) => {
    const [currentSidebarTab, setCurrentSidebarTab] = useState<CIMaterialSidebarType>(CIMaterialSidebarType.CODE_SOURCE)
    const [showRegexBranchChangeModal, setShowRegexBranchChangeModal] = useState<boolean>(
        getIsRegexBranchNotAvailable(selectedCIPipeline, materialList),
    )

    const handleAppChange = (newAppId: number) => {
        handleAppChangeProp?.(newAppId)

        // appId will only change in case of bulk trigger
        setCurrentSidebarTab(CIMaterialSidebarType.CODE_SOURCE)
        if (appList) {
            const targetApp = appList.find((app) => app.appId === newAppId)
            const { filteredCIPipelines, node: targetAppNode, material } = targetApp
            const newSelectedCIPipeline = targetAppNode
                ? filteredCIPipelines.find((pipeline) => +pipeline.id === +targetAppNode.id)
                : null
            setShowRegexBranchChangeModal(getIsRegexBranchNotAvailable(newSelectedCIPipeline, material))
        }
    }

    const nodeId = node?.id
    const isCITriggerBlocked = node?.isTriggerBlocked

    // Can these be multiple?
    const selectedMaterial = materialList.find((material) => material.isSelected) || ({} as CIMaterialType)
    const isWebhookCI = selectedMaterial.type === SourceTypeMap.WEBHOOK
    const ciPipelineURL = getCIPipelineURL(
        String(appId),
        String(workflowId),
        true,
        node?.id,
        isJobView,
        node?.isJobCI,
        false,
    )

    const selectedApp = (appList || []).find((appDetails) => appDetails.appId === +appId)

    const handleCloseBranchRegexModal = () => {
        setShowRegexBranchChangeModal(false)
    }

    const handleShowRegexBranchChangeModal = () => {
        setShowRegexBranchChangeModal(true)
    }

    const handleSelectMaterial = (materialId: string) => {
        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => ({
                ...material,
                isSelected: +material.id === +materialId,
            })),
        )
    }

    const handleSearchChange = (searchText: string) => {
        if (!selectedMaterial) {
            return
        }

        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) =>
                material.id === selectedMaterial.id ? { ...material, searchText } : material,
            ),
        )
    }

    /**
     * Common utility method that takes in updated material [one with update loading state and filters] and fetches the latest material list.
     */
    const fetchMaterialList = async (updatedMaterial: typeof selectedMaterial) => {
        // Not using abortController rather disabling the actions since it fetches a specific material
        const newSelectedMaterialItem = await getCIMaterialList(
            {
                pipelineId: String(nodeId),
                materialId: updatedMaterial.gitMaterialId,
                showExcluded: updatedMaterial.showAllCommits,
            },
            null,
        )
        // Not added source not configured check here since ideally this should not be even called at that moment and we are not adding a new material

        if (!newSelectedMaterialItem.result.length) {
            throw new Error('Unable to fetch material details')
        }

        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => {
                if (material.id === updatedMaterial.id) {
                    return {
                        ...newSelectedMaterialItem.result[0],
                        // For search there we are using updateGitCommitHistory
                        searchText: '',
                        isMaterialLoading: false,
                        // Since material selection can change
                        isSelected: material.isSelected,
                        // This will remain same since disabled
                        showAllCommits: updatedMaterial.showAllCommits,
                    }
                }
                return material
            }),
        )
    }

    const updateGitCommitHistory = async (commitHash: string) => {
        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) =>
                material.id === selectedMaterial.id
                    ? {
                          ...material,
                          isMaterialLoading: true,
                          searchText: commitHash,
                      }
                    : material,
            ),
        )

        try {
            // Note: Here material id is expected instead of gitMaterialId
            const { result: commitHistoryResult } = await getGitMaterialByCommitHash(
                String(selectedMaterial.id),
                commitHash,
            )

            const updatedMaterialKeys = {} as Pick<
                typeof selectedMaterial,
                | 'history'
                | 'isMaterialLoading'
                | 'showAllCommits'
                | 'isMaterialSelectionError'
                | 'materialSelectionErrorMsg'
            >

            updatedMaterialKeys.history = [
                {
                    commitURL: selectedMaterial.gitURL
                        ? createGitCommitUrl(selectedMaterial.gitURL, commitHistoryResult.Commit)
                        : '',
                    commit: commitHistoryResult.Commit || '',
                    author: commitHistoryResult.Author || '',
                    date: commitHistoryResult.Date ? handleUTCTime(commitHistoryResult.Date, false) : '',
                    message: commitHistoryResult.Message || '',
                    changes: commitHistoryResult.Changes || [],
                    showChanges: true,
                    webhookData: commitHistoryResult.WebhookData,
                    isSelected: !commitHistoryResult.Excluded,
                    excluded: commitHistoryResult.Excluded,
                },
            ]

            updatedMaterialKeys.isMaterialLoading = false
            updatedMaterialKeys.showAllCommits = false
            updatedMaterialKeys.isMaterialSelectionError = updatedMaterialKeys.history[0].excluded
            updatedMaterialKeys.materialSelectionErrorMsg = updatedMaterialKeys.history[0].excluded
                ? NO_COMMIT_SELECTED
                : ''

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === selectedMaterial.id
                        ? {
                              ...material,
                              ...updatedMaterialKeys,
                          }
                        : material,
                ),
            )
        } catch (error) {
            showError(error)

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === selectedMaterial.id
                        ? {
                              ...material,
                              isMaterialLoading: false,
                              history: [],
                              noSearchResultsMsg: `Commit not found for ‘${commitHash}’ in branch ‘${selectedMaterial.value}’`,
                              noSearchResult: true,
                              showAllCommits: false,
                              isMaterialSelectionError: true,
                              materialSelectionErrorMsg: NO_COMMIT_SELECTED,
                          }
                        : material,
                ),
            )
        }
    }

    const handleSearchApply = async (commitHash: string) => {
        if (!selectedMaterial) {
            return
        }

        if (commitHash) {
            const commitInLocalHistory = selectedMaterial.history.find((material) => material.commit === commitHash)
            if (commitInLocalHistory) {
                const updatedSelectedMaterial = structuredClone(selectedMaterial)
                updatedSelectedMaterial.history = [
                    { ...commitInLocalHistory, isSelected: !commitInLocalHistory.excluded },
                ]
                updatedSelectedMaterial.isMaterialLoading = false
                updatedSelectedMaterial.showAllCommits = false
                updatedSelectedMaterial.searchText = commitHash
                if (commitInLocalHistory.excluded) {
                    updatedSelectedMaterial.isMaterialSelectionError = true
                    updatedSelectedMaterial.materialSelectionErrorMsg = NO_COMMIT_SELECTED
                }

                setMaterialList((prevMaterialList) =>
                    prevMaterialList.map((material) =>
                        material.id === updatedSelectedMaterial.id ? updatedSelectedMaterial : material,
                    ),
                )
            } else {
                await updateGitCommitHistory(commitHash)
            }
        } else {
            // Won't update searchText here, rather will set to empty on success
            const updatedMaterial: typeof selectedMaterial = {
                ...selectedMaterial,
                isMaterialLoading: true,
            }

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
            )

            try {
                await fetchMaterialList(updatedMaterial)
            } catch (error) {
                showError(error)
                setMaterialList((prevMaterialList) =>
                    prevMaterialList.map((material) =>
                        material.id === updatedMaterial.id ? { ...material, isMaterialLoading: false } : material,
                    ),
                )
            }
        }
    }

    /**
     * This method only clears search and not applies it
     */
    const clearSearchFromSelectedMaterial = () => {
        handleSearchChange('')
    }

    const clearAndApplySearch = async () => {
        await handleSearchApply('')
    }

    const refreshMaterial = async (gitMaterialId: number) => {
        const requiredMaterial = materialList.find((material) => material.gitMaterialId === gitMaterialId)

        if (!requiredMaterial) {
            return
        }

        try {
            // Will set SearchText to empty on success
            const updatedMaterial: typeof requiredMaterial = {
                ...requiredMaterial,
                isMaterialLoading: true,
            }

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
            )

            await refreshGitMaterial(String(updatedMaterial.gitMaterialId), null)
            await fetchMaterialList(updatedMaterial)
        } catch (error) {
            showError(error)
            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === requiredMaterial.id ? { ...material, isMaterialLoading: false } : material,
                ),
            )
        }
    }

    const handleSidebarTabChange = (selectedSidebarTab: OptionType<CIMaterialSidebarType>) => {
        setCurrentSidebarTab(selectedSidebarTab.value as CIMaterialSidebarType)
    }

    const toggleIncludeExcludeCommits = async () => {
        if (!selectedMaterial) {
            return
        }

        const selectedMaterialId = selectedMaterial.id

        // TODO: Need to confirm earlier the key was showChanges in some places but this does not makes sense
        try {
            const updatedMaterial: typeof selectedMaterial = {
                ...selectedMaterial,
                showAllCommits: !selectedMaterial.showAllCommits,
                isMaterialLoading: true,
            }

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === selectedMaterialId
                        ? {
                              ...material,
                              //   Not setting showAllCommits here, rather will set it in fetchMaterialList
                              isMaterialLoading: true,
                          }
                        : material,
                ),
            )
            await fetchMaterialList(updatedMaterial)
        } catch (error) {
            showError(error)
            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === selectedMaterialId ? { ...material, isMaterialLoading: false } : material,
                ),
            )
        }
    }

    const wrapWithBranchRegexButton = (children) => (
        <button
            type="button"
            className="dc__transparent flex dc__gap-8"
            data-testid="edit-branch-name"
            onClick={handleShowRegexBranchChangeModal}
        >
            {children}
        </button>
    )

    const renderExcludedCommitsOption = () => (
        <ActionMenu
            id="toggle-exclude-include-commits"
            onClick={toggleIncludeExcludeCommits}
            options={[
                {
                    items: [
                        {
                            id: selectedMaterial.showAllCommits ? 'hide-excluded-commits' : 'show-excluded-commits',
                            label: selectedMaterial.showAllCommits ? 'Hide excluded commits' : 'Show excluded commits',
                            startIcon: {
                                name: selectedMaterial.showAllCommits ? 'ic-visibility-off' : 'ic-visibility-on',
                                color: 'N700',
                            },
                            isDisabled: selectedMaterial.isMaterialLoading,
                            tooltipProps: selectedMaterial.isMaterialLoading
                                ? {
                                      content: 'Loading commits, please wait...',
                                  }
                                : null,
                        },
                    ],
                },
            ]}
            buttonProps={{
                dataTestId: selectedMaterial.showAllCommits ? 'show-icon-filter' : 'show-icon-filter-applied',
                disabled: selectedMaterial.isMaterialLoading,
                ariaLabel: selectedMaterial.showAllCommits ? 'Show excluded commits' : 'Hide excluded commits',
                icon: (
                    <Icon
                        name={selectedMaterial.showAllCommits ? 'ic-group-filter' : 'ic-group-filter-applied'}
                        color="N900"
                        size={16}
                    />
                ),
                variant: ButtonVariantType.borderLess,
                style: ButtonStyleType.neutral,
            }}
        />
    )

    const uploadFile = ({
        file,
        allowedExtensions,
        maxUploadSize,
    }: Pick<Parameters<typeof uploadCIPipelineFile>[0], 'file' | 'allowedExtensions' | 'maxUploadSize'>) =>
        uploadCIPipelineFile({
            file,
            allowedExtensions,
            maxUploadSize,
            appId: +appId,
            ciPipelineId: +nodeId,
            envId: isJobView && selectedEnv ? +selectedEnv.id : null,
        })

    const renderHeader = () => {
        if (isWebhookCI) {
            return (
                <div className="flex left cn-7 fs-13 fw-6 px-20 py-14 dc__gap-8 bg__tertiary dc__position-sticky dc__top-0">
                    <Icon name="ic-info-filled" color="B500" size={16} />

                    <div className="flex left dc__gap-4 cn-9">
                        <span className="lh-20 cn-9">Showing results matching</span>
                        <CiPipelineSourceConfig
                            sourceType={selectedMaterial.type}
                            sourceValue={selectedMaterial.value}
                            showTooltip
                            baseText="configured filters"
                            showIcons={false}
                            rootClassName="cn-9"
                        />
                        <span className="lh-20">.</span>
                        <Button
                            dataTestId="webhook-modal-cta"
                            variant={ButtonVariantType.text}
                            text={CI_MATERIAL_EMPTY_STATE_MESSAGING.ReceivedWebhookRedirectText}
                            onClick={handleDisplayWebhookModal}
                        />
                    </div>
                </div>
            )
        }

        const excludeIncludeEnv = !window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS
        return (
            <div className="flex dc__content-space dc__position-sticky py-8 px-16 dc__top-0 bg__tertiary">
                <div className="flexbox">
                    <ConditionalWrap condition={!!selectedMaterial.regex} wrap={wrapWithBranchRegexButton}>
                        <span className="flexbox dc__gap-8">
                            <Icon name="ic-git-branch" color="N900" size={16} />
                            <Tooltip
                                className="default-tt dc__word-break-all"
                                placement="top"
                                content={selectedMaterial.value}
                                alwaysShowTippyOnHover
                                interactive
                            >
                                <span className="dc__truncate fs-13 lh-20 fw-6 cn-9">{selectedMaterial.value}</span>
                            </Tooltip>
                        </span>
                    </ConditionalWrap>

                    {selectedMaterial.regex && (
                        <Button
                            dataTestId="edit-branch-name"
                            ariaLabel="Change branch"
                            icon={<Icon name="ic-pencil" color={null} />}
                            variant={ButtonVariantType.borderLess}
                            size={ComponentSizeType.small}
                            showAriaLabelInTippy={false}
                            style={ButtonStyleType.neutral}
                            onClick={handleShowRegexBranchChangeModal}
                        />
                    )}
                </div>

                {!selectedMaterial.isRepoError && !selectedMaterial.isBranchError && (
                    <div className="flex right dc__gap-8">
                        <SearchBar
                            initialSearchText={selectedMaterial.searchText}
                            containerClassName="w-250"
                            handleEnter={handleSearchApply}
                            handleSearchChange={handleSearchChange}
                            inputProps={{
                                placeholder: 'Search by commit hash',
                                autoFocus: true,
                                disabled: selectedMaterial.isMaterialLoading,
                            }}
                            dataTestId="ci-trigger-search-by-commit-hash"
                        />

                        {excludeIncludeEnv && renderExcludedCommitsOption()}
                    </div>
                )}
            </div>
        )
    }

    const getRuntimeParametersHeading = () => {
        const headingPrefix = 'Runtime parameters'
        const headingSuffix = selectedApp ? `for '${selectedApp.name}'` : ''
        return `${headingPrefix} ${headingSuffix}`
    }

    const selectCommit = (commitId: string) => {
        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => {
                if (material.id === selectedMaterial.id) {
                    const updatedHistory = material.history.map((commitHistory) => {
                        if (commitHistory.excluded) {
                            return {
                                ...commitHistory,
                                isSelected: false,
                            }
                        }

                        if (isWebhookCI) {
                            return {
                                ...commitHistory,
                                isSelected:
                                    !!commitHistory?.webhookData?.id &&
                                    String(commitHistory.webhookData.id) === String(commitId),
                            }
                        }

                        return {
                            ...commitHistory,
                            isSelected: commitHistory.commit === commitId,
                        }
                    })

                    return {
                        ...material,
                        history: updatedHistory,
                    }
                }

                return material
            }),
        )
    }

    const renderMissingPluginBlockState = () => (
        <MissingPluginBlockState
            configurePluginURL={ciPipelineURL}
            nodeType={WorkflowNodeType.CI}
            // In case of job [not jobCI] mandatory plugins are not applied
            isJobView={node?.isJobCI}
        />
    )

    const renderMaterialHistory = () => {
        if (MissingPluginBlockState && isCITriggerBlocked && isBulkTrigger) {
            return renderMissingPluginBlockState()
        }

        if (isBulkTrigger) {
            if (selectedApp.node.type === WorkflowNodeType.WEBHOOK) {
                return (
                    <EmptyView
                        imgSrc={externalCiImg}
                        title={`${selectedApp.name}  ${BULK_CI_MESSAGING.webhookCI.title}`}
                        subTitle={BULK_CI_MESSAGING.webhookCI.subTitle}
                        rootClassName="bg__tertiary"
                    />
                )
            }

            if (selectedApp.node.isLinkedCI) {
                return (
                    <EmptyView
                        imgSrc={linkedCiImg}
                        title={`${selectedApp.name} ${BULK_CI_MESSAGING.emptyLinkedCI.title}`}
                        subTitle={BULK_CI_MESSAGING.emptyLinkedCI.subTitle}
                        link={`${URLS.APPLICATION_MANAGEMENT_APP}/${selectedApp.node.parentAppId}/${URLS.APP_CI_DETAILS}/${selectedApp.node.parentCiPipeline}`}
                        linkText={BULK_CI_MESSAGING.emptyLinkedCI.linkText}
                        rootClassName="bg__tertiary"
                    />
                )
            }

            if (selectedApp.node.isLinkedCD) {
                return (
                    <GenericEmptyState
                        title={`${BULK_CI_MESSAGING.linkedCD.title(selectedApp.node.title)}`}
                        subTitle={BULK_CI_MESSAGING.linkedCD.subTitle(selectedApp.node.title)}
                        image={linkedCDBuildCIImg}
                        classname="bg__tertiary"
                    />
                )
            }

            if (selectedApp.materialInitialError || selectedApp.runtimeParamsInitialError) {
                return (
                    <ErrorScreenManager
                        code={selectedApp.materialInitialError?.code || selectedApp.runtimeParamsInitialError?.code}
                        reload={reloadCompleteMaterialList}
                    />
                )
            }
        }

        const areCommitsPresent = selectedMaterial.history?.length > 0
        const materialError =
            selectedMaterial.isMaterialLoading ||
            selectedMaterial.isRepoError ||
            selectedMaterial.isBranchError ||
            selectedMaterial.noSearchResult

        const showHeader =
            currentSidebarTab === CIMaterialSidebarType.CODE_SOURCE &&
            !(node.type === WorkflowNodeType.WEBHOOK || node.isLinkedCI || node.isLinkedCD)

        if (materialError || !areCommitsPresent) {
            return (
                <div className="select-material">
                    {showHeader && renderHeader()}
                    <EmptyStateCIMaterial
                        isRepoError={selectedMaterial.isRepoError}
                        isBranchError={selectedMaterial.isBranchError}
                        isDockerFileError={selectedMaterial.isDockerFileError}
                        isWebHook={isWebhookCI}
                        gitMaterialName={selectedMaterial.gitMaterialName}
                        sourceValue={selectedMaterial.value}
                        repoErrorMsg={selectedMaterial.repoErrorMsg}
                        branchErrorMsg={selectedMaterial.branchErrorMsg}
                        dockerFileErrorMsg={selectedMaterial.dockerFileErrorMsg}
                        repoUrl={selectedMaterial.gitURL}
                        isMaterialLoading={selectedMaterial.isMaterialLoading}
                        onRetry={reloadCompleteMaterialList}
                        anyCommit={areCommitsPresent}
                        noSearchResults={selectedMaterial.noSearchResult}
                        noSearchResultsMsg={selectedMaterial.noSearchResultsMsg}
                        clearSearch={clearAndApplySearch}
                        handleGoToWorkFlowEditor={getHandleOpenURL(`${window.__BASE_URL__}${ciPipelineURL}`)}
                        showAllCommits={selectedMaterial.showAllCommits}
                        toggleExclude={toggleIncludeExcludeCommits}
                        handleDisplayWebhookModal={handleDisplayWebhookModal}
                    />
                </div>
            )
        }

        if (RuntimeParameters && currentSidebarTab === CIMaterialSidebarType.PARAMETERS) {
            return (
                <div className="bg__tertiary dc__overflow-auto flex-1 p-16">
                    <RuntimeParameters
                        // Have to add key for appId since key value config would not be updated incase of app change
                        key={`runtime-parameters-${appId}`}
                        appId={+appId}
                        heading={getRuntimeParametersHeading()}
                        parameters={runtimeParams}
                        handleChange={handleRuntimeParamChange}
                        errorState={runtimeParamsErrorState}
                        handleError={handleRuntimeParamError}
                        uploadFile={uploadFile}
                    />
                </div>
            )
        }

        return (
            <div className="select-material">
                {showHeader && renderHeader()}
                <div className="py-12 px-16">
                    <MaterialHistory
                        material={selectedMaterial}
                        pipelineName={node?.title}
                        selectCommit={selectCommit}
                    />
                </div>
            </div>
        )
    }

    const renderBody = () => {
        if (showWebhookModal) {
            return (
                <CiWebhookModal
                    ciPipelineMaterialId={selectedMaterial.id}
                    gitMaterialUrl={selectedMaterial.gitMaterialUrl}
                    ciPipelineId={+(node?.id || 0)}
                    workflowId={+workflowId}
                    appId={String(appId)}
                    isJobView={isJobView}
                    isJobCI={node?.isJobCI}
                />
            )
        }

        return (
            <div className="dc__grid git-info-material__container w-100 h-100 dc__overflow-auto">
                <TriggerBuildSidebar
                    currentSidebarTab={currentSidebarTab}
                    handleSidebarTabChange={handleSidebarTabChange}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    materialList={materialList}
                    selectMaterial={handleSelectMaterial}
                    clearSearch={clearSearchFromSelectedMaterial}
                    refreshMaterial={refreshMaterial}
                    appList={appList}
                    appId={appId}
                    handleAppChange={handleAppChange}
                    isBlobStorageConfigured={isBlobStorageConfigured}
                    toggleSelectedAppIgnoreCache={toggleSelectedAppIgnoreCache}
                />

                {renderMaterialHistory()}
            </div>
        )
    }

    return (
        <>
            {MissingPluginBlockState && isCITriggerBlocked && !isBulkTrigger
                ? renderMissingPluginBlockState()
                : renderBody()}

            {showRegexBranchChangeModal && (
                <BranchRegexModal
                    material={materialList}
                    selectedCIPipeline={selectedCIPipeline}
                    title={node?.title}
                    onCloseBranchRegexModal={handleCloseBranchRegexModal}
                    appId={appId}
                    ciPipelineId={node ? +node.id : null}
                    // This will ensure ciTriggerDetails are also updated
                    handleReload={handleReloadWithWorkflows}
                />
            )}
        </>
    )
}

export default GitInfoMaterial
