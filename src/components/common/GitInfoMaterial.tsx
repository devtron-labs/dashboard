import React, { useState, useEffect } from 'react'
import { SourceTypeMap } from '../../config'
import { MaterialHistory, CIMaterialType } from '../app/details/triggerView/MaterialHistory'
import { MaterialSource } from '../app/details/triggerView/MaterialSource'
import { EmptyStateCIMaterial } from '../app/details/triggerView//EmptyStateCIMaterial'
import CiWebhookModal from '../app/details/triggerView/CiWebhookDebuggingModal'
import { ReactComponent as Back } from '../../assets/icons/ic-back.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Right } from '../../assets/icons/ic-arrow-left.svg'
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig'
import { ReactComponent as Branch } from '../../assets/icons/ic-git-branch.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Edit } from '../../assets/icons/misc/editBlack.svg'
import Tippy from '@tippyjs/react'

export default function GitInfoMaterial({
    context,
    material,
    title,
    pipelineId,
    pipelineName,
    selectedMaterial,
    commitInfo,
    showWebhookModal,
    toggleWebhookModal,
    webhookPayloads,
    isWebhookPayloadLoading,
    hideWebhookModal,
    workflowId,
    onClickShowBranchRegexModal,
    ciPipeline,
}) {
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    useEffect(() => {
        if (!selectedMaterial || !selectedMaterial.searchText) {
            setSearchText('')
        } else if (selectedMaterial.searchText !== searchText) {
            setSearchText(selectedMaterial.searchText)
        }
    }, [selectedMaterial])

    function renderMaterialHeader() {
        return (
            <div className="trigger-modal__header">
                <h1 className="modal__title flex left fs-16">
                    {showWebhookModal ? (
                        <button type="button" className="transparent flex" onClick={() => hideWebhookModal()}>
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
                            <span className="fs-16"> All incoming webhook payloads </span>{' '}
                        </>
                    ) : null}
                </h1>
                <button
                    type="button"
                    className="transparent"
                    onClick={() => {
                        context.closeCIModal()
                        hideWebhookModal()
                    }}
                >
                    <Close className="" />
                </button>
            </div>
        )
    }

    function renderMaterialSource(context) {
        let refreshMaterial = {
            refresh: context.refreshMaterial,
            title: title,
            pipelineId: pipelineId,
        }
        return (
            <div className="material-list">
                <div className="material-list__title material-list__title--border-bottom">Git Repository</div>
                <MaterialSource
                    material={material}
                    selectMaterial={context.selectMaterial}
                    refreshMaterial={refreshMaterial}
                />
            </div>
        )
    }

    const isBranchRegex = (material: CIMaterialType) => {
        if (ciPipeline) {
            for (let mat of ciPipeline.ciMaterial) {
                if (mat.gitMaterialId === material.gitMaterialId) {
                    return mat.source?.type === SourceTypeMap.BranchRegex || mat.isRegex
                }
            }
        }
        return false
    }

    const renderBranchChangeHeader = (material: CIMaterialType) => {
        const isNoError = !material.isRepoError && !material.isBranchError
        return (
            isBranchRegex(material) && (
                <div className="fs-13 lh-20" style={{ background: 'var(--window-bg)' }}>
                    <div
                        className={` fw-6 flex cursor ${
                            !isNoError ? 'content-space w-100' : 'left'
                        } pl-20 pr-20 pt-12 pb-12 cn-9`}
                        onClick={() => onClickChangebranch(true)}
                    >
                        <div className="flex">
                            <Branch className="hw-100 mr-8" />
                            {material.value}
                        </div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content={'Change branch'}
                            interactive={true}
                        >
                            <button type="button" className="transparent flexbox">
                                <Edit className="icon-dim-16" />
                            </button>
                        </Tippy>
                    </div>
                </div>
            )
        )
    }
    const handleFilterChanges = (_searchText: string): void => {
        context.getMaterialByCommit(pipelineId, title, selectedMaterial.id, _searchText)
    }

    const clearSearch = (): void => {
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
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search position-rel en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search by commit hash"
                    value={searchText}
                    className="search__input"
                    onChange={handleInputChange}
                    onKeyDown={handleFilterKeyPress}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    function renderMaterialHistory(context, material: CIMaterialType) {
        let anyCommit = material.history && material.history.length > 0
        return (
            <div className="select-material select-material--trigger-view">
                <div
                    className="flex content-space position-sticky"
                    style={{ backgroundColor: 'var(--window-bg)', top: 0 }}
                >
                    {!!material.regex && renderBranchChangeHeader(material)}

                    {!material.isRepoError && !material.isBranchError && (
                        <>
                            {!material.regex && <div className="material-list__title cn-9">Select commit to build</div>}
                            {renderSearch()}
                        </>
                    )}
                </div>
                {material.isMaterialLoading ||
                material.isRepoError ||
                material.isBranchError ||
                material.noSearchResult ||
                !anyCommit ? (
                    <div className="select-material__empty-state-container flex">
                        <EmptyStateCIMaterial
                            isRepoError={material.isRepoError}
                            isBranchError={material.isBranchError}
                            isWebHook={material.type === SourceTypeMap.WEBHOOK}
                            gitMaterialName={material.gitMaterialName}
                            sourceValue={material.value}
                            repoErrorMsg={material.repoErrorMsg}
                            branchErrorMsg={material.branchErrorMsg}
                            repoUrl={material.gitURL}
                            isMaterialLoading={material.isMaterialLoading}
                            toggleWebHookModal={() => toggleWebhookModal(material.id)}
                            onRetry={(e) => {
                                e.stopPropagation()
                                context.onClickCIMaterial(pipelineId, pipelineName)
                            }}
                            anyCommit={anyCommit}
                            noSearchResults={material.noSearchResult}
                            noSearchResultsMsg={material.noSearchResultsMsg}
                            clearSearch={clearSearch}
                        />
                    </div>
                ) : (
                    <>
                        {material.type === SourceTypeMap.WEBHOOK && (
                            <div className="cn-7 fs-12 fw-0 pl-20 flex left">
                                Showing results matching &nbsp;
                                <CiPipelineSourceConfig
                                    sourceType={material.type}
                                    sourceValue={material.value}
                                    showTooltip={true}
                                    baseText="configured filters"
                                    showIcons={false}
                                />
                                .
                                <span
                                    className="learn-more__href cursor"
                                    onClick={() => toggleWebhookModal(material.id)}
                                >
                                    View all incoming webhook payloads
                                </span>
                            </div>
                        )}
                        <MaterialHistory
                            material={material}
                            pipelineName={pipelineName}
                            selectCommit={context.selectCommit}
                            toggleChanges={context.toggleChanges}
                        />
                    </>
                )}
            </div>
        )
    }

    const renderWebhookModal = (context) => {
        return (
            <div>
                <CiWebhookModal
                    context={context}
                    webhookPayloads={webhookPayloads}
                    ciPipelineMaterialId={material[0].id}
                    ciPipelineId={pipelineId}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    hideWebhookModal={hideWebhookModal}
                    workflowId={workflowId}
                />
            </div>
        )
    }

    const onClickChangebranch = (isBranchChangedClicked) => {
        onClickShowBranchRegexModal(isBranchChangedClicked)
    }

    return (
        <>
            {renderMaterialHeader()}
            <div className={`m-lr-0 ${showWebhookModal ? null : 'flexbox'}`}>
                {showWebhookModal == true ? (
                    renderWebhookModal(context)
                ) : (
                    <>
                        {renderMaterialSource(context)}
                        {renderMaterialHistory(context, selectedMaterial)}
                    </>
                )}
            </div>
        </>
    )
}
