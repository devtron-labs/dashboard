import { useState } from 'react'

import {
    ActionMenu,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CIMaterialSidebarType,
    CiPipelineSourceConfig,
    ComponentSizeType,
    ConditionalWrap,
    createGitCommitUrl,
    getHandleOpenURL,
    handleUTCTime,
    Icon,
    MaterialHistory,
    SearchBar,
    showError,
    SourceTypeMap,
    Tooltip,
    uploadCIPipelineFile,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList, getGitMaterialByCommitHash, refreshGitMaterial } from '@Components/app/service'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { NO_COMMIT_SELECTED } from '@Config/constants'

import { CiWebhookModal } from '../CiWebhookDebuggingModal'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING } from '../Constants'
import EmptyStateCIMaterial from '../EmptyStateCIMaterial'
import TriggerBuildSidebar from './TriggerBuildSidebar'
import { GitInfoMaterialProps } from './types'

import './GitInfoMaterial.scss'

const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')

const GitInfoMaterial = ({
    appId,
    workflow,
    isJobView,
    setMaterialList,
    runtimeParamsErrorState,
    materialList,
    showWebhookModal,
    reloadCompleteMaterialList,
    onClickShowBranchRegexModal,
    handleRuntimeParamChange,
    handleRuntimeParamError,
    selectedEnv,
    runtimeParams,
    handleDisplayWebhookModal,
}: GitInfoMaterialProps) => {
    const [currentSidebarTab, setCurrentSidebarTab] = useState<CIMaterialSidebarType>(CIMaterialSidebarType.CODE_SOURCE)
    const workflowId = workflow.id
    // TODO: Check if send prop
    const ciNode = workflow.nodes.find((node) => node.type === WorkflowNodeType.CI)
    const ciNodeId = ciNode?.id
    const isCITriggerBlocked = ciNode?.isTriggerBlocked
    // Can these be multiple?
    const selectedMaterial = materialList.find((material) => material.isSelected)
    const isWebhook = selectedMaterial?.type === SourceTypeMap.WEBHOOK
    const ciPipelineURL = getCIPipelineURL(
        String(appId),
        String(workflowId),
        true,
        ciNode?.id,
        isJobView,
        ciNode?.isJobCI,
        false,
    )

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
        // TODO: Check if abortController is needed
        // FIXME: Lets disable search on refresh
        const newSelectedMaterialItem = await getCIMaterialList(
            {
                pipelineId: String(ciNodeId),
                materialId: updatedMaterial.gitMaterialId,
                showExcluded: updatedMaterial.showAllCommits,
            },
            null,
        )

        if (!newSelectedMaterialItem.result.length) {
            throw new Error('Unable to fetch material details')
        }

        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => {
                if (material.id === updatedMaterial.id) {
                    return {
                        ...newSelectedMaterialItem.result[0],
                        searchText: '',
                        isMaterialLoading: false,
                        isSelected: updatedMaterial.isSelected,
                        showAllCommits: updatedMaterial.showAllCommits,
                    }
                }
                return material
            }),
        )
    }

    const updateGitCommitHistory = async (commitHash: string) => {
        const updatedMaterial: typeof selectedMaterial = {
            ...selectedMaterial,
            isMaterialLoading: true,
            searchText: commitHash,
        }

        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
        )

        try {
            const { result: commitHistoryResult } = await getGitMaterialByCommitHash(ciNodeId, commitHash)

            updatedMaterial.history = [
                {
                    commitURL: updatedMaterial.gitURL
                        ? createGitCommitUrl(updatedMaterial.gitURL, commitHistoryResult.Commit)
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

            updatedMaterial.isMaterialLoading = false
            updatedMaterial.showAllCommits = false
            updatedMaterial.isMaterialSelectionError = updatedMaterial.history[0].excluded
            updatedMaterial.materialSelectionErrorMsg = updatedMaterial.history[0].excluded ? NO_COMMIT_SELECTED : ''

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
            )
        } catch (error) {
            showError(error)

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) =>
                    material.id === updatedMaterial.id
                        ? {
                              ...material,
                              isMaterialLoading: false,
                              history: [],
                              noSearchResultsMsg: `Commit not found for ‘${commitHash}’ in branch ‘${updatedMaterial.value}’`,
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
            // Won't update searchText here, will be set to empty on success
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
                // TODO: Can common out
                setMaterialList((prevMaterialList) =>
                    prevMaterialList.map((material) =>
                        material.id === updatedMaterial.id ? { ...material, isMaterialLoading: false } : material,
                    ),
                )
            }
        }
    }

    // This also needs to trigger re-fetch of material list
    // TODO: Look into searchText reset states
    const clearSearchFromSelectedMaterial = () => {
        handleSearchChange('')
    }

    const refreshMaterial = async () => {
        if (!selectedMaterial) {
            return
        }

        const selectedMaterialId = selectedMaterial.id

        try {
            // Will set SearchText to empty on success
            const updatedMaterial: typeof selectedMaterial = {
                ...selectedMaterial,
                isMaterialLoading: true,
            }

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
            )

            // TODO: AbortController
            await refreshGitMaterial(String(updatedMaterial.gitMaterialId), null)
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

    const handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSidebarTab(e.target.value as CIMaterialSidebarType)
    }

    const toggleIncludeExcludeCommits = async () => {
        if (!selectedMaterial) {
            return
        }

        const selectedMaterialId = selectedMaterial.id

        try {
            const updatedMaterial: typeof selectedMaterial = {
                ...selectedMaterial,
                showAllCommits: !selectedMaterial.showAllCommits,
                isMaterialLoading: true,
            }

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => (material.id === updatedMaterial.id ? updatedMaterial : material)),
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
            onClick={onClickShowBranchRegexModal}
        >
            {children}
        </button>
    )

    const renderExcludedCommitsOption = () => (
        <ActionMenu
            id="toggle-exclude-include-commits"
            onClick={onClickShowBranchRegexModal}
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
                        },
                    ],
                },
            ]}
            buttonProps={{
                dataTestId: selectedMaterial.showAllCommits ? 'show-icon-filter' : 'show-icon-filter-applied',
                ariaLabel: selectedMaterial.showAllCommits ? 'Show excluded commits' : 'Hide excluded commits',
                icon: (
                    <Icon
                        name={selectedMaterial.showAllCommits ? 'ic-group-filter' : 'ic-group-filter-applied'}
                        color="N900"
                        size={16}
                    />
                ),
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
            ciPipelineId: +ciNodeId,
            envId: isJobView && selectedEnv ? +selectedEnv.id : null,
        })

    const renderHeader = () => {
        if (isWebhook) {
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
                                <span className="dc__ellipsis-right fs-13 lh-20 fw-6 cn-9">
                                    {selectedMaterial.value}
                                </span>
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
                            onClick={onClickShowBranchRegexModal}
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
        // FIXME: Add for bulk
        // const headingSuffix = appName ? `for '${appName}'` : ''
        // return `${headingPrefix} ${headingSuffix}`
        return headingPrefix
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

                        if (isWebhook) {
                            return {
                                ...commitHistory,
                                isSelected:
                                    commitHistory?.webhookData?.id &&
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

    const renderMaterialHistory = () => {
        const areCommitsPresent = selectedMaterial.history?.length > 0
        const materialError =
            selectedMaterial.isMaterialLoading ||
            selectedMaterial.isRepoError ||
            selectedMaterial.isBranchError ||
            selectedMaterial.noSearchResult

        const showHeader =
            currentSidebarTab === CIMaterialSidebarType.CODE_SOURCE &&
            !(ciNode.type === WorkflowNodeType.WEBHOOK || ciNode.isLinkedCI || ciNode.isLinkedCD)

        if (materialError || !areCommitsPresent) {
            return (
                <div className="select-material">
                    {showHeader && renderHeader()}
                    <EmptyStateCIMaterial
                        isRepoError={selectedMaterial.isRepoError}
                        isBranchError={selectedMaterial.isBranchError}
                        isDockerFileError={selectedMaterial.isDockerFileError}
                        isWebHook={isWebhook}
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
                        clearSearch={clearSearchFromSelectedMaterial}
                        handleGoToWorkFlowEditor={getHandleOpenURL(ciPipelineURL)}
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
                        pipelineName={ciNode?.title}
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
                    ciPipelineId={+(ciNode?.id || 0)}
                    workflowId={+workflowId}
                    appId={String(appId)}
                    isJobView={isJobView}
                    isJobCI={ciNode?.isJobCI}
                />
            )
        }

        return (
            <div className="dc__grid git-info-material__container w-100 h-100 dc__overflow-auto">
                <TriggerBuildSidebar
                    ciNodeId={+ciNodeId}
                    currentSidebarTab={currentSidebarTab}
                    handleSidebarTabChange={handleSidebarTabChange}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    materialList={materialList}
                    selectMaterial={handleSelectMaterial}
                    clearSearch={clearSearchFromSelectedMaterial}
                    refreshMaterial={refreshMaterial}
                />

                {renderMaterialHistory()}
            </div>
        )
    }

    return MissingPluginBlockState && isCITriggerBlocked ? (
        <MissingPluginBlockState
            configurePluginURL={ciPipelineURL}
            nodeType={WorkflowNodeType.CI}
            // In case of job [not jobCI] mandatory plugins are not applied
            isJobView={ciNode?.isJobCI}
        />
    ) : (
        renderBody()
    )
}

export default GitInfoMaterial
