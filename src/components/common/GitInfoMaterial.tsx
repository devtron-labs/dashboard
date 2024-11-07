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

import { useState, useEffect, useContext } from 'react'
import {
    not,
    stopPropagation,
    CIMaterialSidebarType,
    CiPipelineSourceConfig,
    MaterialHistory,
    CIMaterialType,
    SearchBar,
    SourceTypeMap,
    CommonNodeAttr,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { useHistory, useLocation } from 'react-router-dom'
import MaterialSource from '../app/details/triggerView/MaterialSource'
import EmptyStateCIMaterial from '../app/details/triggerView/EmptyStateCIMaterial'
import CiWebhookModal from '../app/details/triggerView/CiWebhookDebuggingModal'
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Right } from '../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as BranchFixed } from '../../assets/icons/misc/branch.svg'
import { ReactComponent as Edit } from '../../assets/icons/misc/editBlack.svg'
import { ReactComponent as Hide } from '../../assets/icons/ic-visibility-off.svg'
import { ReactComponent as Show } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as ShowIconFilter } from '../../assets/icons/ic-group-filter.svg'
import { ReactComponent as ShowIconFilterApplied } from '../../assets/icons/ic-group-filter-applied.svg'
import { getCIPipelineURL, importComponentFromFELibrary } from '.'
import { TriggerViewContext } from '../app/details/triggerView/config'

const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')

// TODO: ADD prop type
export default function GitInfoMaterial({
    dataTestId = '',
    material,
    title,
    pipelineId,
    pipelineName,
    selectedMaterial,
    showWebhookModal,
    toggleWebhookModal,
    webhookPayloads,
    isWebhookPayloadLoading,
    hideWebhookModal,
    workflowId,
    onClickShowBranchRegexModal,
    fromAppGrouping,
    appId,
    // Only coming from BulkCI
    appName = null,
    fromBulkCITrigger,
    hideSearchHeader,
    isJobView = false,
    isJobCI = false,
    isCITriggerBlocked = false,
    // Not required for BulkCI
    currentSidebarTab,
    // Not required for BulkCI
    handleSidebarTabChange,
    runtimeParams,
    handleRuntimeParamChange,
    handleRuntimeParamError,
}) {
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [showAllCommits, setShowAllCommits] = useState(false)
    const [showExcludePopUp, setShowExcludePopUp] = useState(false)

    const { push } = useHistory()
    const location = useLocation()
    const triggerViewContext = useContext(TriggerViewContext)

    useEffect(() => {
        if (!selectedMaterial || !selectedMaterial.searchText) {
            setSearchText('')
            setSearchApplied(false)
        } else if (selectedMaterial.searchText) {
            setSearchText(selectedMaterial.searchText)
            setSearchApplied(true)
        }
        setShowAllCommits(selectedMaterial?.showAllCommits ?? false)
    }, [selectedMaterial])

    const onClickCloseButton = (): void => {
        triggerViewContext.closeCIModal()
        hideWebhookModal()
    }

    function renderMaterialHeader() {
        return (
            <div className={`trigger-modal__header ${fromBulkCITrigger ? 'bcn-0' : ''}`}>
                <h1 data-testid="build-deploy-pipeline-name-heading" className="modal__title flex left fs-16">
                    {showWebhookModal ? (
                        <button type="button" className="dc__transparent flex" onClick={hideWebhookModal}>
                            <Back className="mr-16" />
                        </button>
                    ) : null}
                    {title}
                    {showWebhookModal ? (
                        <>
                            <Right
                                className="rotate icon-dim-24 ml-16 mr-16"
                                style={{ ['--rotateBy' as any]: '-180deg' }}
                            />
                            <span className="fs-16"> All incoming webhook payloads </span>
                        </>
                    ) : null}
                </h1>
                <button type="button" className="dc__transparent" onClick={onClickCloseButton}>
                    <Close />
                </button>
            </div>
        )
    }

    function renderMaterialSource() {
        const refreshMaterial = {
            refresh: triggerViewContext.refreshMaterial,
            pipelineId,
        }
        const sidebarTabs = Object.values(CIMaterialSidebarType).map((tabValue) => ({
            value: tabValue,
            label: tabValue,
        }))

        return (
            <div className="material-list dc__overflow-hidden" style={{ height: 'calc(100vh - 136px)' }}>
                {RuntimeParamTabs ? (
                    <div className="flex pt-12 pb-12 pl-16 pr-16 dc__gap-4">
                        <RuntimeParamTabs
                            tabs={sidebarTabs}
                            initialTab={currentSidebarTab}
                            onChange={handleSidebarTabChange}
                        />
                    </div>
                ) : (
                    <div className="material-list__title material-list__title--border-bottom pt-12 pb-12 pl-20 pr-20">
                        Git Repository
                    </div>
                )}

                <MaterialSource
                    material={material}
                    selectMaterial={triggerViewContext.selectMaterial}
                    refreshMaterial={refreshMaterial}
                    clearSearch={clearSearch}
                />
            </div>
        )
    }

    const onClickHeader = (e): void => {
        stopPropagation(e)
        if (selectedMaterial.regex) {
            onClickShowBranchRegexModal(true)
        }
    }

    const renderBranchChangeHeader = (selectedMaterial: CIMaterialType): JSX.Element => {
        return (
            <div
                className={`fs-13 lh-20 fw-6 flex ${selectedMaterial.regex ? 'cursor' : ''} cn-9`}
                style={{ background: 'var(--window-bg)' }}
                onClick={onClickHeader}
            >
                <BranchFixed className=" mr-8 icon-color-n9 mw-14" />
                {showWebhookModal ? (
                    'Select commit to build'
                ) : (
                    <Tippy
                        className="default-tt dc__word-break-all"
                        arrow={false}
                        placement="top"
                        content={selectedMaterial.value}
                        interactive
                    >
                        <div className="dc__ellipsis-right">{selectedMaterial.value}</div>
                    </Tippy>
                )}
                {selectedMaterial.regex && (
                    <Tippy className="default-tt" arrow={false} placement="top" content="Change branch" interactive>
                        <button data-testid={dataTestId} type="button" className="dc__transparent flexbox">
                            <Edit className="icon-dim-16" />
                        </button>
                    </Tippy>
                )}
            </div>
        )
    }
    const handleFilterChanges = (_searchText: string): void => {
        triggerViewContext.getMaterialByCommit(
            pipelineId,
            selectedMaterial.id,
            selectedMaterial.gitMaterialId,
            _searchText,
        )
    }

    const clearSearch = (e): void => {
        stopPropagation(e)
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (_searchText: string): void => {
        setSearchText(_searchText)
        handleFilterChanges(_searchText)
    }

    const goToWorkFlowEditor = () => {
        const ciPipelineURL = getCIPipelineURL(appId, workflowId, true, pipelineId, isJobView, isJobCI)
        if (fromAppGrouping) {
            window.open(window.location.href.replace(location.pathname, ciPipelineURL), '_blank', 'noreferrer')
        } else {
            push(ciPipelineURL)
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <SearchBar
                initialSearchText={searchText}
                containerClassName="w-250"
                handleEnter={handleFilterKeyPress}
                inputProps={{
                    placeholder: 'Search by commit hash',
                    autoFocus: true,
                }}
                dataTestId="ci-trigger-search-by-commit-hash"
            />
        )
    }

    const onRetry = (e) => {
        e.stopPropagation()
        triggerViewContext.onClickCIMaterial(pipelineId, pipelineName)
    }

    const _toggleWebhookModal = () => {
        toggleWebhookModal(selectedMaterial.id)
    }

    const toggleShowExcludePopUp = () => {
        setShowExcludePopUp(not)
    }

    const toggleExclude = (e): void => {
        if (fromBulkCITrigger) {
            stopPropagation(e)
        }
        setShowAllCommits(!showAllCommits)
        clearSearch(e)
        triggerViewContext.getFilteredMaterial(pipelineId, selectedMaterial.gitMaterialId, !showAllCommits)
    }

    const renderExcludedCommitsOption = () => {
        return (
            <div className="dc__position-rel cursor">
                <div className="mw-18" onClick={toggleShowExcludePopUp}>
                    {showAllCommits ? (
                        <ShowIconFilter data-testid="show-icon-filter" className="icon-dim-20" />
                    ) : (
                        <ShowIconFilterApplied data-testid="show-icon-filter-applied" className="icon-dim-20" />
                    )}
                </div>
                {showExcludePopUp && (
                    <div
                        className="flex left p-10 pointer dc__position-abs dc__top-26 dc__right-0 h-40 w-182 bcn-0 br-4 dc__zi-20"
                        style={{
                            boxShadow: '0 2px 4px 0 rgba(21, 21, 21, 0.3)',
                        }}
                        onClick={toggleExclude}
                    >
                        {showAllCommits ? (
                            <>
                                <Hide data-testid="hide-excluded-commits" className="icon-dim-16 mr-10" />
                                Hide excluded commits
                            </>
                        ) : (
                            <>
                                <Show data-testid="show-excluded-commits" className="icon-dim-16 mr-10" />
                                Show excluded commits
                            </>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const renderMaterialHistoryHeader = (selectedMaterial: CIMaterialType) => {
        const excludeIncludeEnv = !window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS

        return (
            <div
                className="flex dc__content-space dc__position-sticky py-8 px-16"
                style={{ backgroundColor: 'var(--window-bg)', top: 0 }}
            >
                <div className="dc__mxw-300">{renderBranchChangeHeader(selectedMaterial)}</div>
                {!selectedMaterial.isRepoError && !selectedMaterial.isBranchError && (
                    <div className="flex right dc__gap-8">
                        {renderSearch()}
                        {excludeIncludeEnv && renderExcludedCommitsOption()}
                    </div>
                )}
            </div>
        )
    }

    const getRuntimeParametersHeading = () => {
        const headingPrefix = 'Runtime parameters'
        const headingSuffix = appName ? `for '${appName}'` : ''
        return `${headingPrefix} ${headingSuffix}`
    }

    function renderMaterialHistory(selectedMaterial: CIMaterialType) {
        const anyCommit = selectedMaterial.history?.length > 0
        const isWebhook = selectedMaterial.type === SourceTypeMap.WEBHOOK
        const materialError =
            selectedMaterial.isMaterialLoading ||
            selectedMaterial.isRepoError ||
            selectedMaterial.isBranchError ||
            selectedMaterial.noSearchResult
        const showHeader = !isWebhook && !hideSearchHeader && currentSidebarTab === CIMaterialSidebarType.CODE_SOURCE

        if (materialError || !anyCommit) {
            return (
                <div className="select-material select-material--trigger-view">
                    {showHeader && renderMaterialHistoryHeader(selectedMaterial)}

                    <div className="select-material__empty-state-container flex dc__position-rel">
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
                            toggleWebHookModal={_toggleWebhookModal}
                            onRetry={onRetry}
                            anyCommit={anyCommit}
                            noSearchResults={selectedMaterial.noSearchResult}
                            noSearchResultsMsg={selectedMaterial.noSearchResultsMsg}
                            clearSearch={clearSearch}
                            handleGoToWorkFlowEditor={goToWorkFlowEditor}
                            showAllCommits={showAllCommits}
                            toggleExclude={toggleExclude}
                        />
                    </div>
                </div>
            )
        }

        if (RuntimeParameters && currentSidebarTab === CIMaterialSidebarType.PARAMETERS) {
            return (
                <RuntimeParameters
                    // Have to add key for appId since key value config would not be updated incase of app change
                    key={`runtime-parameters-${appId}`}
                    heading={getRuntimeParametersHeading()}
                    parameters={runtimeParams}
                    handleChange={handleRuntimeParamChange}
                    onError={handleRuntimeParamError}
                />
            )
        }

        return (
            <div className="select-material select-material--trigger-view">
                {showHeader && renderMaterialHistoryHeader(selectedMaterial)}

                {selectedMaterial.type === SourceTypeMap.WEBHOOK && (
                    <div className="cn-7 fs-12 fw-0 pl-20 flex left">
                        Showing results matching &nbsp;
                        <CiPipelineSourceConfig
                            sourceType={selectedMaterial.type}
                            sourceValue={selectedMaterial.value}
                            showTooltip
                            baseText="configured filters"
                            showIcons={false}
                        />
                        .&nbsp;
                        <span className="dc__link cursor" onClick={_toggleWebhookModal}>
                            View all incoming webhook payloads
                        </span>
                    </div>
                )}
                <div className="flexbox-col dc__gap-12 py-12 px-16">
                    <MaterialHistory
                        material={selectedMaterial}
                        pipelineName={pipelineName}
                        ciPipelineId={pipelineId}
                        selectCommit={triggerViewContext.selectCommit}
                    />
                </div>
            </div>
        )
    }

    const renderWebhookModal = () => {
        return (
            <div className={` ${fromBulkCITrigger ? 'dc__position-fixed bcn-0 env-modal-width full-height' : ''}`}>
                <CiWebhookModal
                    context={triggerViewContext}
                    webhookPayloads={webhookPayloads}
                    ciPipelineMaterialId={material[0].id}
                    ciPipelineId={pipelineId}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    hideWebhookModal={hideWebhookModal}
                    workflowId={workflowId}
                    fromAppGrouping={fromAppGrouping}
                    fromBulkCITrigger={fromBulkCITrigger}
                    appId={appId}
                    isJobView={isJobView}
                />
            </div>
        )
    }

    const nodeType: CommonNodeAttr['type'] = 'CI'

    return (
        <>
            {(!fromBulkCITrigger || showWebhookModal) && renderMaterialHeader()}
            {MissingPluginBlockState && isCITriggerBlocked ? (
                <MissingPluginBlockState configurePluginURL={getCIPipelineURL(appId, workflowId, true, pipelineId, false, isJobCI)} nodeType={nodeType} />
            ) : (
                <div className={`m-lr-0 ${showWebhookModal || fromBulkCITrigger ? '' : 'flexbox'}`}>
                    {showWebhookModal == true ? (
                        renderWebhookModal()
                    ) : (
                        <>
                            {!fromBulkCITrigger && renderMaterialSource()}
                            {renderMaterialHistory(selectedMaterial ?? material)}
                        </>
                    )}
                </div>
            )}
        </>
    )
}
