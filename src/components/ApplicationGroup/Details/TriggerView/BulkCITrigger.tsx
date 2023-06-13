import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    ServerErrors,
    Drawer,
    Progressing,
    showError,
    stopPropagation,
    noop,
    ConsequenceType,
    ConsequenceAction,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary, useAsync } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as PlayIcon } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Warning } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import externalCiImg from '../../../../assets/img/external-ci.png'
import linkedCiImg from '../../../../assets/img/linked-ci.png'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { DOCUMENTATION, ModuleNameMap, SourceTypeMap, SOURCE_NOT_CONFIGURED, URLS } from '../../../../config'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { getCIMaterialList } from '../../../app/service'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { RegexValueType } from '../../../app/details/triggerView/types'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'
import BranchRegexModal from '../../../app/details/triggerView/BranchRegexModal'
import { savePipeline } from '../../../ciPipeline/ciPipeline.service'
import { BulkCIDetailType, BulkCITriggerType } from '../../AppGroup.types'
import { IGNORE_CACHE_INFO } from '../../../app/details/triggerView/Constants'
import Tippy from '@tippyjs/react'
import TriggerResponseModal from './TriggerResponseModal'
import { BULK_CI_MESSAGING } from '../../Constants'
import { processConsequenceData } from '../../AppGroup.utils'

const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')
const getCIBlockState = importComponentFromFELibrary('getCIBlockState', null, 'function')

export default function BulkCITrigger({
    appList,
    closePopup,
    updateBulkInputMaterial,
    onClickTriggerBulkCI,
    showWebhookModal,
    toggleWebhookModal,
    webhookPayloads,
    isWebhookPayloadLoading,
    hideWebhookModal,
    isShowRegexModal,
    responseList,
    isLoading,
    setLoading,
}: BulkCITriggerType) {
    const ciTriggerDetailRef = useRef<HTMLDivElement>(null)
    const [showRegexModal, setShowRegexModal] = useState(false)
    const [isChangeBranchClicked, setChangeBranchClicked] = useState(false)
    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>({})
    const [appIgnoreCache, setAppIgnoreCache] = useState<Record<number, boolean>>({})
    const [appPolicy, setAppPolicy] = useState<Record<number, ConsequenceType>>({})
    const [selectedApp, setSelectedApp] = useState<BulkCIDetailType>(appList[0])
    const [blobStorageConfigurationLoading, blobStorageConfiguration] = useAsync(
        () => getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
        [],
    )
    const {
        selectMaterial,
        refreshMaterial,
    }: {
        selectMaterial: (materialId, pipelineId?: number) => void
        refreshMaterial: (ciNodeId: number, materialId: number, abortController?: AbortController) => void
    } = useContext(TriggerViewContext)
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const closeBulkCIModal = (evt) => {
        abortControllerRef.current.abort()
        closePopup(evt)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closeBulkCIModal(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            ciTriggerDetailRef.current &&
            !ciTriggerDetailRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closeBulkCIModal(evt)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    useEffect(() => {
        for (const _app of appList) {
            appIgnoreCache[_app.ciPipelineId] = false
        }
        getMaterialData()
    }, [])

    const getMaterialData = (): void => {
        abortControllerRef.current = new AbortController()
        const _CIMaterialPromiseList = appList.map((appDetails) =>
            appDetails.isWebhookCI || appDetails.isLinkedCI
                ? null
                : getCIMaterialList(
                      {
                          pipelineId: appDetails.ciPipelineId,
                      },
                      abortControllerRef.current.signal,
                  ),
        )
        if (_CIMaterialPromiseList?.length) {
            const _materialListMap: Record<string, any[]> = {}
            Promise.all(_CIMaterialPromiseList)
                .then((responses) => {
                    responses.forEach((res, index) => {
                        _materialListMap[appList[index]?.appId] = res?.['result']
                    })
                    getPolicyEnforcementData(_materialListMap)
                    updateBulkInputMaterial(_materialListMap)
                    if (!selectedApp.isLinkedCI && !selectedApp.isWebhookCI) {
                        setShowRegexModal(
                            isShowRegexModal(
                                selectedApp.appId,
                                +selectedApp.ciPipelineId,
                                _materialListMap[selectedApp.appId],
                            ),
                        )
                    }
                    setLoading(false)
                })
                .catch((error) => {
                    if (!abortControllerRef.current.signal.aborted) {
                        showError(error)
                        setLoading(false)
                    }
                })
        } else {
            setLoading(false)
        }
    }

    const getPolicyEnforcementData = (_materialListMap: Record<string, any[]>): void => {
        const policyPromiseList = appList.map((appDetails) => {
            if (appDetails.isWebhookCI || appDetails.isLinkedCI || !_materialListMap[appDetails.appId]) {
                return null
            } else {
                let branchNames = ''
                for (const material of _materialListMap[appDetails.appId]) {
                    if (
                        (!material.isBranchError && !material.isRepoError && !material.isRegex) ||
                        material.value !== '--'
                    ) {
                        branchNames += `${branchNames ? ',' : ''}${material.value}`
                    }
                }
                return !branchNames ? null : getCIBlockState(appDetails.ciPipelineId, appDetails.appId, branchNames)
            }
        })
        if (policyPromiseList?.length) {
            const policyListMap: Record<string, ConsequenceType> = {}
            Promise.all(policyPromiseList)
                .then((responses) => {
                    responses.forEach((res, index) => {
                        policyListMap[appList[index]?.appId] = res?.['result']
                            ? processConsequenceData(res['result'])
                            : null
                    })
                    setAppPolicy(policyListMap)
                })
                .catch((error) => {})
        }
    }

    const renderHeaderSection = (): JSX.Element | null => {
        if (showWebhookModal) {
            return null
        }

        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Build image</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={isLoading}
                    onClick={closeBulkCIModal}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const showBranchEditModal = (): void => {
        setShowRegexModal(true)
        setChangeBranchClicked(false)
    }

    const hideBranchEditModal = (e?): void => {
        if (e) {
            stopPropagation(e)
        }
        setShowRegexModal(false)
        setChangeBranchClicked(false)
    }

    const changeApp = (e): void => {
        stopPropagation(e)
        const _selectedApp = appList[e.currentTarget.dataset.index]
        if (_selectedApp.appId !== selectedApp.appId) {
            setSelectedApp(_selectedApp)
            if (_selectedApp.isLinkedCI || _selectedApp.isWebhookCI) {
                setShowRegexModal(false)
            } else {
                setShowRegexModal(
                    isShowRegexModal(_selectedApp.appId, +_selectedApp.ciPipelineId, _selectedApp.material),
                )
            }
        }
    }

    const saveBranchName = () => {
        setLoading(true)
        const payload: any = {
            appId: selectedApp.appId,
            id: +selectedApp.workFlowId,
            ciPipelineMaterial: [],
        }

        const selectedCIPipeline = selectedApp.filteredCIPipelines?.find(
            (_ciPipeline) => _ciPipeline?.id == selectedApp.ciPipelineId,
        )
        // Populate the ciPipelineMaterial with flatten object
        if (selectedCIPipeline?.ciMaterial?.length) {
            for (const _cm of selectedCIPipeline.ciMaterial) {
                const regVal = regexValue[_cm.gitMaterialId]
                let _updatedCM
                if (regVal?.value && _cm.source.regex) {
                    isRegexValueInvalid(_cm)

                    _updatedCM = {
                        ..._cm,
                        type: SourceTypeMap.BranchFixed,
                        value: regVal.value,
                        regex: _cm.source.regex,
                    }
                } else {
                    // To maintain the flatten object structure supported by API for unchanged values
                    // as during update/next click it uses the fetched ciMaterial structure i.e. containing source
                    _updatedCM = {
                        ..._cm,
                        ..._cm.source,
                    }
                }

                // Deleting as it's not required in the request payload
                delete _updatedCM['source']
                payload.ciPipelineMaterial.push(_updatedCM)
            }
        }

        savePipeline(payload, true)
            .then((response) => {
                if (response) {
                    getMaterialData()
                } else {
                    setLoading(true)
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setLoading(false)
            })
    }

    const isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexValue = { ...regexValue }
            _regexValue[_cm.gitMaterialId] = { value: regVal.value, isInvalid: true }
            setRegexValue(_regexValue)
        }
    }

    const handleRegexInputValueChange = (id, value, mat) => {
        const _regexValue = { ...regexValue }
        _regexValue[id] = { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) }
        setRegexValue(_regexValue)
    }

    const renderMainContent = (selectedMaterialList: any[]): JSX.Element => {
        if (showRegexModal) {
            const selectedCIPipeline = selectedApp.filteredCIPipelines?.find(
                (_ciPipeline) => _ciPipeline?.id == selectedApp.ciPipelineId,
            )
            return (
                <>
                    <BranchRegexModal
                        material={selectedMaterialList}
                        selectedCIPipeline={selectedCIPipeline}
                        showWebhookModal={false}
                        title={selectedApp.ciPipelineName}
                        isChangeBranchClicked={isChangeBranchClicked}
                        onClickNextButton={saveBranchName}
                        onShowCIModal={noop}
                        handleRegexInputValue={handleRegexInputValueChange}
                        regexValue={regexValue}
                        onCloseBranchRegexModal={hideBranchEditModal}
                        hideHeaderFooter={true}
                        savingRegexValue={isLoading}
                    />
                    <div className="flex right pr-20 pb-20">
                        <button className="cta cancel h-28 lh-28-imp mr-16" onClick={hideBranchEditModal}>
                            Cancel
                        </button>
                        <button className="cta h-28 lh-28-imp" onClick={saveBranchName}>
                            Save
                        </button>
                    </div>
                </>
            )
        } else if (selectedApp.isLinkedCI) {
            return (
                <EmptyView
                    imgSrc={linkedCiImg}
                    title={`${selectedApp.name} ${BULK_CI_MESSAGING.emptyLinkedCI.title}`}
                    subTitle={BULK_CI_MESSAGING.emptyLinkedCI.subTitle}
                    link={`${URLS.APP}/${selectedApp.parentAppId}/${URLS.APP_CI_DETAILS}/${selectedApp.parentCIPipelineId}`}
                    linkText={BULK_CI_MESSAGING.emptyLinkedCI.linkText}
                />
            )
        } else if (selectedApp.isWebhookCI) {
            return (
                <EmptyView
                    imgSrc={externalCiImg}
                    title={`${selectedApp.name}  ${BULK_CI_MESSAGING.webhookCI.title}`}
                    subTitle={BULK_CI_MESSAGING.webhookCI.subTitle}
                />
            )
        } else {
            const selectedMaterial = selectedMaterialList?.find((mat) => mat.isSelected)
            return (
                <GitInfoMaterial
                    material={selectedMaterialList}
                    title={selectedApp.ciPipelineName}
                    pipelineId={selectedApp.ciPipelineId}
                    pipelineName={selectedApp.ciPipelineName}
                    selectedMaterial={selectedMaterial}
                    showWebhookModal={showWebhookModal}
                    hideWebhookModal={hideWebhookModal}
                    toggleWebhookModal={toggleWebhookModal}
                    webhookPayloads={webhookPayloads}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    workflowId={selectedApp.workFlowId}
                    onClickShowBranchRegexModal={showBranchEditModal}
                    fromAppGrouping={true}
                    appId={selectedApp.appId}
                    fromBulkCITrigger={true}
                    hideSearchHeader={selectedApp.hideSearchHeader}
                    isCITriggerBlocked={appPolicy[selectedApp.appId]?.action === ConsequenceAction.BLOCK}
                    ciBlockState={appPolicy[selectedApp.appId]}
                />
            )
        }
    }

    const handleChange = (e): void => {
        const _appIgnoreCache = { ...appIgnoreCache }
        _appIgnoreCache[selectedApp.ciPipelineId] = !_appIgnoreCache[selectedApp.ciPipelineId]
        setAppIgnoreCache(_appIgnoreCache)
    }

    const tippyContent = (tippyTile: string, tippyDescription: string): JSX.Element => {
        return (
            <div>
                <div className="fs-12 fw-6 cn-0">{tippyTile}</div>
                <div className="fs-12 fw-4 cn-0">{tippyDescription}</div>
            </div>
        )
    }

    const renderTippy = (infoText: string, tippyTile: string, tippyDescription: string): JSX.Element | null => {
        return (
            <Tippy
                className="default-tt w-200 fs-12"
                arrow={false}
                placement="right"
                content={tippyContent(tippyTile, tippyDescription)}
            >
                <div className="flex left cursor dc_width-max-content">
                    <InfoIcon className="icon-dim-20 info-icon-n6 mr-4" />
                    <span className="fw-4 fs-13 cn-9">{infoText}</span>
                </div>
            </Tippy>
        )
    }

    const renderCacheSection = (): JSX.Element | null => {
        if (!selectedApp.isLinkedCI && !selectedApp.isWebhookCI && !showRegexModal) {
            if (selectedApp.isFirstTrigger) {
                return renderTippy(
                    BULK_CI_MESSAGING.isFirstTrigger.infoText,
                    BULK_CI_MESSAGING.isFirstTrigger.title,
                    BULK_CI_MESSAGING.isFirstTrigger.subTitle,
                )
            } else if (!selectedApp.isCacheAvailable) {
                return renderTippy(
                    BULK_CI_MESSAGING.cacheNotAvailable.infoText,
                    BULK_CI_MESSAGING.cacheNotAvailable.title,
                    BULK_CI_MESSAGING.cacheNotAvailable.subTitle,
                )
            } else if (blobStorageConfiguration?.result.enabled) {
                return (
                    <div className="flex left mt-12 dc__border-top pt-12">
                        <input
                            type="checkbox"
                            className="mt-0-imp cursor"
                            data-app-id={selectedApp.appId}
                            checked={appIgnoreCache?.[selectedApp.ciPipelineId]}
                            id={`chkValidate-${selectedApp.appId}`}
                            onChange={handleChange}
                        />
                        <label className="fs-13 fw-4 cn-9 ml-10 mb-0">Ignore cache</label>
                    </div>
                )
            } else {
                return null
            }
        }
    }

    const _refreshMaterial = (pipelineId: number, gitMaterialId: number) => {
        abortControllerRef.current = new AbortController()
        refreshMaterial(pipelineId, gitMaterialId, abortControllerRef.current)
    }

    const renderSelectedAppMaterial = (appId: number, selectedMaterialList: any[]): JSX.Element | null => {
        if (appId === selectedApp.appId && !!selectedMaterialList.length && !showRegexModal) {
            return (
                <>
                    <MaterialSource
                        material={selectedMaterialList}
                        selectMaterial={selectMaterial}
                        refreshMaterial={{
                            refresh: _refreshMaterial,
                            pipelineId: +selectedApp.ciPipelineId,
                        }}
                        ciPipelineId={+selectedApp.ciPipelineId}
                    />
                    {renderCacheSection()}
                </>
            )
        } else {
            return null
        }
    }

    const renderAppName = (app: BulkCIDetailType, index: number): JSX.Element | null => {
        return (
            <div
                className={`fw-6 fs-13 cn-9 pt-12 ${app.appId === selectedApp.appId ? 'pb-12' : ''}`}
                onClick={changeApp}
                data-index={index}
            >
                {app.name}
                {app.warningMessage && (
                    <span className="flex left cy-7 fw-4 fs-12">
                        <Warning className="icon-dim-12 warning-icon-y7 mr-4" />
                        {app.warningMessage}
                    </span>
                )}
                {app.appId !== selectedApp.appId && app.errorMessage && (
                    <span className="flex left cr-5 fw-4 fs-12">
                        <Error className="icon-dim-12 mr-4 mw-14" />
                        <span className="dc__block dc__ellipsis-right">{app.errorMessage}</span>
                    </span>
                )}
                {appPolicy[app.appId] && PolicyEnforcementMessage && (
                    <PolicyEnforcementMessage consequence={appPolicy[app.appId]} />
                )}
            </div>
        )
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        const selectedMaterialList = appList.find((app) => app.appId === selectedApp.appId)?.material || []
        return (
            <div className={`bulk-ci-trigger  ${showWebhookModal ? 'webhook-modal' : ''}`}>
                {!showWebhookModal && (
                    <div className="sidebar bcn-0 dc__height-inherit dc__overflow-auto">
                        <div
                            className="dc__position-sticky dc__top-0 bcn-0 dc__border-bottom fw-6 fs-13 cn-9 p-12 "
                            style={{ zIndex: 1 }}
                        >
                            Applications
                        </div>
                        {appList.map((app, index) => (
                            <div
                                className={`material-list pr-12 pl-12 pb-12 ${
                                    app.appId === selectedApp.appId ? 'dc__window-bg' : 'dc__border-bottom-n1 cursor'
                                }`}
                                key={`app-${app.appId}`}
                            >
                                {renderAppName(app, index)}
                                {renderSelectedAppMaterial(app.appId, selectedMaterialList)}
                            </div>
                        ))}
                    </div>
                )}
                <div className="main-content dc__window-bg dc__height-inherit dc__overflow-auto">
                    {renderMainContent(selectedMaterialList)}
                </div>
            </div>
        )
    }

    const onClickStartBuild = (): void => {
        onClickTriggerBulkCI(appIgnoreCache)
    }

    const onClickRetryBuild = (appsToRetry: Record<string, boolean>): void => {
        onClickTriggerBulkCI(appIgnoreCache, appsToRetry)
    }

    const isStartBuildDisabled = (): boolean => {
        return appList.some(
            (app) =>
                app.errorMessage &&
                (app.errorMessage !== SOURCE_NOT_CONFIGURED ||
                    !app.material.some(
                        (_mat) => !_mat.isBranchError && !_mat.isRepoError && !_mat.isMaterialSelectionError,
                    )),
        )
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className={`dc__border-top flex right bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width ${
                    !blobStorageConfigurationLoading && !blobStorageConfiguration?.result?.enabled
                        ? 'dc__content-space'
                        : ''
                }`}
            >
                {!blobStorageConfigurationLoading && !blobStorageConfiguration?.result?.enabled && (
                    <div className="flexbox flex-align-center">
                        <Storage className="icon-dim-24 mr-8" />
                        <div>
                            <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                            <div className="fw-4 fs-12 flexbox">
                                <span>{IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}</span>
                                <a
                                    className="fs-12 fw-6 cb-5 dc__no-decor ml-4"
                                    href={DOCUMENTATION.BLOB_STORAGE}
                                    target="_blank"
                                >
                                    {IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                                </a>
                                <OpenInNew className="icon-dim-16 mt-3 ml-8" />
                            </div>
                        </div>
                    </div>
                )}
                <button
                    className="cta flex h-36"
                    data-testid="start-build"
                    onClick={onClickStartBuild}
                    disabled={isStartBuildDisabled()}
                >
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <>
                            <PlayIcon className="trigger-btn__icon" />
                            Start Build
                        </>
                    )}
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="dc__window-bg h-100 bulk-ci-trigger-container" ref={ciTriggerDetailRef}>
                {renderHeaderSection()}
                {responseList.length ? (
                    <TriggerResponseModal
                        closePopup={closePopup}
                        responseList={responseList}
                        isLoading={isLoading}
                        onClickRetryBuild={onClickRetryBuild}
                    />
                ) : (
                    <>
                        {renderBodySection()}
                        {renderFooterSection()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
