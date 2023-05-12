import React, { useState, useEffect, useContext } from 'react'
import { PopupMenu, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { SourceTypeMap } from '../../config'
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory'
import MaterialSource from '../app/details/triggerView/MaterialSource'
import EmptyStateCIMaterial from '../app/details/triggerView//EmptyStateCIMaterial'
import CiWebhookModal from '../app/details/triggerView/CiWebhookDebuggingModal'
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Right } from '../../assets/icons/ic-arrow-left.svg'
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig'
import { ReactComponent as BranchFixed } from '../../assets/icons/misc/branch.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Edit } from '../../assets/icons/misc/editBlack.svg'
import { ReactComponent as Hide } from '../../assets/icons/ic-visibility-off.svg'
import { ReactComponent as Show } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as ShowIconFilter } from '../../assets/icons/ic-group-filter.svg'
import { ReactComponent as ShowIconFilterApplied } from '../../assets/icons/ic-group-filter-applied.svg'
import Tippy from '@tippyjs/react'
import { getCIPipelineURL } from '../common'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'
import { TriggerViewContext } from '../app/details/triggerView/config'

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
    fromBulkCITrigger,
    hideSearchHeader,
    isJobView = false,
}) {
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [showAllCommits, setShowAllCommits] = useState(false)
    const { push } = useHistory()
    const location = useLocation()
    const triggerViewContext = useContext(TriggerViewContext)

    useEffect(() => {
        if (!selectedMaterial || !selectedMaterial.searchText) {
            setSearchText('')
            setSearchApplied(false)
        } else if (selectedMaterial.searchText !== searchText) {
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
            pipelineId: pipelineId,
        }
        return (
            <div className="material-list dc__overflow-hidden" style={{ height: 'calc(100vh - 136px)' }}>
                <div className="material-list__title material-list__title--border-bottom pt-12 pb-12 pl-20 pr-20">
                    Git Repository
                </div>
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
                className={`fs-13 lh-20 pl-20 pr-20 pt-12 pb-12 fw-6 flex ${
                    selectedMaterial.regex ? 'cursor' : ''
                } cn-9`}
                style={{ background: 'var(--window-bg)' }}
                onClick={onClickHeader}
            >
                <BranchFixed className=" mr-8 icon-color-n9" />
                {showWebhookModal ? (
                    'Select commit to build'
                ) : (
                    <div className="dc__ellipsis-right">{selectedMaterial.value}</div>
                )}
                {selectedMaterial.regex && (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={'Change branch'}
                        interactive={true}
                    >
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

    const handleInputChange = (event): void => {
        setSearchText(event.target.value)
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            if (event.target.value) {
                handleFilterChanges(event.target.value)
                setSearchApplied(true)
            } else if (searchApplied) {
                setSearchApplied(false)
            }
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch(event)
        }
    }

    const goToWorkFlowEditor = () => {
        const ciPipelineURL = getCIPipelineURL(appId, workflowId, true, pipelineId, isJobView)
        if (fromAppGrouping) {
            window.open(window.location.href.replace(location.pathname, ciPipelineURL), '_blank', 'noreferrer')
        } else {
            push(ciPipelineURL)
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    data-testid="ci-trigger-search-by-commit-hash"
                    type="text"
                    placeholder="Search by commit hash"
                    value={searchText}
                    className="search__input"
                    onChange={handleInputChange}
                    onKeyDown={handleFilterKeyPress}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    const onRetry = (e) => {
        e.stopPropagation()
        triggerViewContext.onClickCIMaterial(pipelineId, pipelineName)
    }

    const _toggleWebhookModal = () => {
        toggleWebhookModal(selectedMaterial.id)
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
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="mw-18" isKebab>
                    {showAllCommits ? (
                        <ShowIconFilter className="icon-dim-20" />
                    ) : (
                        <ShowIconFilterApplied className="icon-dim-20" />
                    )}
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <div className="flex left p-10 pointer" onClick={toggleExclude}>
                        {showAllCommits ? (
                            <>
                                <Hide className="icon-dim-16 mr-10" />
                                Hide excluded commits
                            </>
                        ) : (
                            <>
                                <Show className="icon-dim-16 mr-10" />
                                Show excluded commits
                            </>
                        )}
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
        )
    }

    function renderMaterialHistory(selectedMaterial: CIMaterialType) {
        let anyCommit = selectedMaterial.history?.length > 0
        const isWebhook = selectedMaterial.type === SourceTypeMap.WEBHOOK
        return (
            <div className="select-material select-material--trigger-view">
                {!isWebhook && !hideSearchHeader && (
                    <div
                        className="flex dc__content-space dc__position-sticky "
                        style={{ backgroundColor: 'var(--window-bg)', top: 0 }}
                    >
                        {renderBranchChangeHeader(selectedMaterial)}
                        {!selectedMaterial.isRepoError && !selectedMaterial.isBranchError && (
                            <div className="flex right mr-20">
                                {renderSearch()}
                                {renderExcludedCommitsOption()}
                            </div>
                        )}
                    </div>
                )}

                {selectedMaterial.isMaterialLoading ||
                selectedMaterial.isRepoError ||
                selectedMaterial.isBranchError ||
                selectedMaterial.noSearchResult ||
                !anyCommit ? (
                    <div className="select-material__empty-state-container flex">
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
                ) : (
                    <>
                        {selectedMaterial.type === SourceTypeMap.WEBHOOK && (
                            <div className="cn-7 fs-12 fw-0 pl-20 flex left">
                                Showing results matching &nbsp;
                                <CiPipelineSourceConfig
                                    sourceType={selectedMaterial.type}
                                    sourceValue={selectedMaterial.value}
                                    showTooltip={true}
                                    baseText="configured filters"
                                    showIcons={false}
                                />
                                .&nbsp;
                                <span className="dc__link cursor" onClick={_toggleWebhookModal}>
                                    View all incoming webhook payloads
                                </span>
                            </div>
                        )}
                        <MaterialHistory
                            material={selectedMaterial}
                            pipelineName={pipelineName}
                            ciPipelineId={pipelineId}
                            selectCommit={triggerViewContext.selectCommit}
                            toggleChanges={triggerViewContext.toggleChanges}
                        />
                    </>
                )}
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

    return (
        <>
            {(!fromBulkCITrigger || showWebhookModal) && renderMaterialHeader()}
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
        </>
    )
}
