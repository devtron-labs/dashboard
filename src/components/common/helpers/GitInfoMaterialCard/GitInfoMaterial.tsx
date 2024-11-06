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
    ComponentSizeType,
    ButtonVariantType,
    Button,
    ButtonStyleType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as BranchFixed } from '@Icons/misc/branch.svg'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { ReactComponent as Hide } from '@Icons/ic-visibility-off.svg'
import { ReactComponent as Show } from '@Icons/ic-visibility-on.svg'
import { ReactComponent as ShowIconFilter } from '@Icons/ic-group-filter.svg'
import { ReactComponent as ShowIconFilterApplied } from '@Icons/ic-group-filter-applied.svg'
import { ReactComponent as Info } from '@Icons/info-filled.svg'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import EmptyStateCIMaterial from '../../../app/details/triggerView/EmptyStateCIMaterial'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { getCIPipelineURL } from '../workflowURL'
import { importComponentFromFELibrary } from '../Helpers'
import { GitInfoMaterialProps } from './types'
import { ReceivedWebhookRedirectButton } from './ReceivedWebhookRedirectButton'

const BuildTriggerBlockedState = importComponentFromFELibrary('BuildTriggerBlockedState')
const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const RuntimeParameters = importComponentFromFELibrary('RuntimeParameters', null, 'function')

export const GitInfoMaterial = ({
    dataTestId = '',
    material,
    title,
    pipelineId,
    pipelineName,
    selectedMaterial,
    workflowId,
    onClickShowBranchRegexModal,
    fromAppGrouping,
    // Only coming from BulkCI
    appName = null,
    fromBulkCITrigger,
    hideSearchHeader,
    isJobView = false,
    isJobCI = false,
    isCITriggerBlocked = false,
    // Not required for BulkCI
    currentSidebarTab,
    handleSidebarTabChange,
    runtimeParams,
    handleRuntimeParamChange,
    handleRuntimeParamError,
}: GitInfoMaterialProps) => {
    const { push } = useHistory()
    const location = useLocation()
    const { appId } = useParams<{ appId: string }>()
    const triggerViewContext = useContext(TriggerViewContext)

    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [showAllCommits, setShowAllCommits] = useState(false)
    const [showExcludePopUp, setShowExcludePopUp] = useState(false)

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
    }

    function renderMaterialHeader() {
        return (
            <div
                className={`ci-webhook-header flex dc__content-space px-20 py-12 dc__border-bottom ${fromBulkCITrigger ? 'bcn-0' : ''}`}
            >
                <h2
                    data-testid="build-deploy-pipeline-name-heading"
                    className="modal__title flex left fs-16 dc__gap-12"
                >
                    <div className="flex left">
                        <span className="dc__mxw-250 dc__truncate">{title}</span>
                    </div>
                </h2>

                <Button
                    dataTestId={`${dataTestId}-close-button`}
                    ariaLabel="Cancel"
                    icon={<Close />}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    showAriaLabelInTippy={false}
                    style={ButtonStyleType.negativeGrey}
                    onClick={onClickCloseButton}
                />
            </div>
        )
    }

    const handleFilterChanges = (_searchText: string): void => {
        triggerViewContext.getMaterialByCommit(
            +pipelineId,
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

    function renderMaterialSource() {
        const refreshMaterial = {
            refresh: triggerViewContext.refreshMaterial,
            pipelineId: Number(pipelineId),
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
            onClickShowBranchRegexModal()
        }
    }

    const renderBranchChangeHeader = (_selectedMaterial: CIMaterialType): JSX.Element => (
        <div
            className={`fs-13 lh-20 fw-6 flex ${selectedMaterial.regex ? 'cursor' : ''} cn-9 dc__window-bg`}
            onClick={onClickHeader}
        >
            <BranchFixed className=" mr-8 icon-color-n9 mw-14" />
            <Tippy
                className="default-tt dc__word-break-all"
                arrow={false}
                placement="top"
                content={_selectedMaterial.value}
                interactive
            >
                <div className="dc__ellipsis-right">{_selectedMaterial.value}</div>
            </Tippy>
            {_selectedMaterial.regex && (
                <Button
                    dataTestId={dataTestId}
                    ariaLabel="Change branch"
                    icon={<Edit />}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.small}
                    showAriaLabelInTippy={false}
                    style={ButtonStyleType.neutral}
                />
            )}
        </div>
    )

    const handleFilterKeyPress = (_searchText: string): void => {
        setSearchText(_searchText)
        handleFilterChanges(_searchText)
    }

    const goToWorkFlowEditor = () => {
        const ciPipelineURL = getCIPipelineURL(appId, workflowId.toString(), true, pipelineId, isJobView, isJobCI)
        if (fromAppGrouping) {
            window.open(window.location.href.replace(location.pathname, ciPipelineURL), '_blank', 'noreferrer')
        } else {
            push(ciPipelineURL)
        }
    }

    const renderSearch = (): JSX.Element => (
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

    const onRetry = (e) => {
        e.stopPropagation()
        triggerViewContext.onClickCIMaterial(pipelineId, pipelineName)
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
        triggerViewContext.getFilteredMaterial(+pipelineId, selectedMaterial.gitMaterialId, !showAllCommits)
    }

    const renderExcludedCommitsOption = () => (
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

    const renderMaterialHistoryHeader = (_selectedMaterial: CIMaterialType) => {
        const excludeIncludeEnv = !window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS

        return (
            <div className="flex dc__content-space dc__position-sticky py-8 px-16 dc__window-bg top">
                {renderBranchChangeHeader(_selectedMaterial)}
                {!_selectedMaterial.isRepoError && !_selectedMaterial.isBranchError && (
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

    const renderWebhookHeader = () =>
        selectedMaterial.type === SourceTypeMap.WEBHOOK && (
            <div className="flex left cn-7 fs-13 fw-6 px-20 py-14 dc__gap-8 dc__backdrop-filter-5">
                <Info className="icon-dim-16" />
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
                    <ReceivedWebhookRedirectButton />
                </div>
            </div>
        )

    function renderMaterialHistory(_selectedMaterial: CIMaterialType) {
        const anyCommit = _selectedMaterial.history?.length > 0
        const isWebhook = _selectedMaterial.type === SourceTypeMap.WEBHOOK
        const materialError =
            _selectedMaterial.isMaterialLoading ||
            _selectedMaterial.isRepoError ||
            _selectedMaterial.isBranchError ||
            _selectedMaterial.noSearchResult
        const showHeader = !isWebhook && !hideSearchHeader && currentSidebarTab === CIMaterialSidebarType.CODE_SOURCE

        if (materialError || !anyCommit) {
            return (
                <div className="select-material select-material--trigger-view">
                    {showHeader && renderMaterialHistoryHeader(_selectedMaterial)}

                    <div className="select-material__empty-state-container flex dc__position-rel">
                        <EmptyStateCIMaterial
                            isRepoError={_selectedMaterial.isRepoError}
                            isBranchError={_selectedMaterial.isBranchError}
                            isDockerFileError={_selectedMaterial.isDockerFileError}
                            isWebHook={isWebhook}
                            gitMaterialName={_selectedMaterial.gitMaterialName}
                            sourceValue={_selectedMaterial.value}
                            repoErrorMsg={_selectedMaterial.repoErrorMsg}
                            branchErrorMsg={_selectedMaterial.branchErrorMsg}
                            dockerFileErrorMsg={_selectedMaterial.dockerFileErrorMsg}
                            repoUrl={_selectedMaterial.gitURL}
                            isMaterialLoading={_selectedMaterial.isMaterialLoading}
                            onRetry={onRetry}
                            anyCommit={anyCommit}
                            noSearchResults={_selectedMaterial.noSearchResult}
                            noSearchResultsMsg={_selectedMaterial.noSearchResultsMsg}
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
            <div className="dc__flex-1 dc__window-bg select-material select-material--trigger-view">
                {showHeader && renderMaterialHistoryHeader(selectedMaterial)}
                {renderWebhookHeader()}
                <MaterialHistory
                    material={selectedMaterial}
                    pipelineName={pipelineName}
                    ciPipelineId={String(pipelineId)}
                    selectCommit={triggerViewContext.selectCommit}
                />
            </div>
        )
    }

    const redirectToCIPipeline = () => {
        const ciPipelineURL = getCIPipelineURL(appId, workflowId.toString(), true, pipelineId, false, isJobCI)
        if (fromAppGrouping) {
            window.open(window.location.href.replace(location.pathname, ciPipelineURL), '_blank', 'noreferrer')
        } else {
            push(ciPipelineURL)
        }
    }

    return (
        <>
            {!fromBulkCITrigger && renderMaterialHeader()}
            {BuildTriggerBlockedState && isCITriggerBlocked ? (
                <BuildTriggerBlockedState clickHandler={redirectToCIPipeline} />
            ) : (
                <div className={`m-lr-0 h-100 ${fromBulkCITrigger ? '' : 'flexbox'}`}>
                    {!fromBulkCITrigger && renderMaterialSource()}
                    {renderMaterialHistory(selectedMaterial)}
                </div>
            )}
        </>
    )
}
