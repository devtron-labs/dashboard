import React, { useContext, useEffect, useRef, useState } from 'react'
import { Drawer, noop, Progressing, showError, stopPropagation, useAsync } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as PlayIcon } from '../../../../assets/icons/ic-play-medium.svg'
import { ReactComponent as Warning } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-alert-triangle.svg'
import externalCiImg from '../../../../assets/img/external-ci.png'
import linkedCiImg from '../../../../assets/img/linked-ci.png'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { ModuleNameMap, SourceTypeMap, URLS } from '../../../../config'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { getCIMaterialList } from '../../../app/service'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { RegexValueType, WebhookPayloads } from '../../../app/details/triggerView/types'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'
import BranchRegexModal from '../../../app/details/triggerView/BranchRegexModal'
import { ServerErrors } from '../../../../modals/commonTypes'
import { savePipeline } from '../../../ciPipeline/ciPipeline.service'

interface AppWorkflowDetailsType {
    workFlowId: number
    appId: number
    name: string
    ciPipelineName: string
    ciPipelineId: string
    isFirstTrigger: boolean
    isCacheAvailable: boolean
    isLinkedCI: boolean
    isWebhookCI: boolean
    parentAppId: string
    parentCIPipelineId: boolean
    material: any[]
    warningMessage: string
    errorMessage: string
    isHideSearchHeader: boolean
    filteredCIPipelines: any
}
interface BulkCITriggerType {
    appList: AppWorkflowDetailsType[]
    closePopup: (e) => void
    updateBulkInputMaterial: (materialList: Record<string, any[]>) => void
    onClickTriggerBulkCI: () => void
    showWebhookModal: boolean
    toggleWebhookModal: (id, webhookTimeStampOrder) => void
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    hideWebhookModal: (e?) => void
    isShowRegexModal: (_appId: number, ciNodeId: number, inputMaterialList: any[]) => boolean
}

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
}: BulkCITriggerType) {
    const ciTriggerDetailRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(true)
    const [showRegexModal, setShowRegexModal] = useState(false)
    const [isChangeBranchClicked, setChangeBranchClicked] = useState(false)
    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>({})
    const [selectedApp, setSelectedApp] = useState<AppWorkflowDetailsType>(appList[0])
    const [, blobStorageConfiguration] = useAsync(() => getModuleConfigured(ModuleNameMap.BLOB_STORAGE), [])
    const {
        selectMaterial,
        refreshMaterial,
    }: {
        selectMaterial: (materialId, pipelineId?: number) => void
        refreshMaterial: (ciNodeId: number, pipelineName: string, materialId: number) => void
    } = useContext(TriggerViewContext)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closePopup(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            ciTriggerDetailRef.current &&
            !ciTriggerDetailRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closePopup(evt)
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
        getMaterialData()
    }, [])

    const getMaterialData = (): void => {
        const _CIMaterialPromiseList = appList.map((appDetails) =>
            appDetails.isWebhookCI || appDetails.isLinkedCI
                ? null
                : getCIMaterialList({
                      pipelineId: appDetails.ciPipelineId,
                  }),
        )
        if (_CIMaterialPromiseList?.length) {
            const _materialListMap: Record<string, any[]> = {}
            Promise.all(_CIMaterialPromiseList)
                .then((responses) => {
                    responses.forEach((res, index) => {
                        _materialListMap[appList[index]?.appId] = res?.['result']
                    })
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
                    showError(error)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }

    const renderHeaderSection = (): JSX.Element | null => {
        if (showWebhookModal) {
            return null
        }

        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-17 pr-20 pb-17 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Build image</h2>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={closePopup}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const showBranchEditModal = (): void => {
        setShowRegexModal(true)
        setChangeBranchClicked(false)
    }

    const hideBranchEditModal = (): void => {
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
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
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
                    />
                    <div className="flex right pr-20 pb-20">
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
                    title={`${selectedApp.name} is using a linked build pipeline`}
                    subTitle="You can trigger the parent build pipeline. Triggering the parent build pipeline will trigger all build pipelines linked to it."
                    link={`${URLS.APP}/${selectedApp.parentAppId}/${URLS.APP_CI_DETAILS}/${selectedApp.parentCIPipelineId}`}
                    linkText="View Source Pipeline"
                />
            )
        } else if (selectedApp.isWebhookCI) {
            return (
                <EmptyView
                    imgSrc={externalCiImg}
                    title={`${selectedApp.name} is using a external build pipeline`}
                    subTitle="Images received from the external service will be available for deployment."
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
                    isFromEnv={true}
                    appId={selectedApp.appId}
                    isFromBulkCI={true}
                    isHideSearchHeader={selectedApp.isHideSearchHeader}
                />
            )
        }
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
                        {appList.map((app, index) => (
                            <div
                                className={`material-list pr-12 pl-12 ${
                                    app.appId === selectedApp.appId ? 'dc__window-bg' : 'dc__border-bottom-n1 cursor'
                                }`}
                                key={`app-${index}`}
                            >
                                <div className="fw-6 fs-13 cn-9 pt-12 pb-12" onClick={changeApp} data-index={index}>
                                    {app.name}
                                    {app.warningMessage && (
                                        <span className="flex left cy-7 fw-4 fs-12">
                                            <Warning className="icon-dim-12 warning-icon-y7 mr-4" />
                                            {app.warningMessage}
                                        </span>
                                    )}
                                    {app.appId !== selectedApp.appId && app.errorMessage && (
                                        <span className="flex left cr-5 fw-4 fs-12">
                                            <Error className="icon-dim-12 mr-4" />
                                            {app.errorMessage}
                                        </span>
                                    )}
                                </div>
                                {app.appId === selectedApp.appId && (
                                    <>
                                        {!!selectedMaterialList.length && (
                                            <MaterialSource
                                                material={selectedMaterialList}
                                                selectMaterial={selectMaterial}
                                                refreshMaterial={{
                                                    refresh: refreshMaterial,
                                                    title: app.ciPipelineName,
                                                    pipelineId: +app.ciPipelineId,
                                                }}
                                                ciPipelineId={+app.ciPipelineId}
                                            />
                                        )}
                                        {!selectedApp.isLinkedCI && !selectedApp.isWebhookCI && (
                                            <div className="flex left mt-12 dc__border-top pt-12 pb-12">
                                                <input
                                                    type="checkbox"
                                                    className="mt-0-imp cursor"
                                                    data-app-id={app.appId}
                                                    checked={true}
                                                    id={`chkValidate-${app.appId}`}
                                                />
                                                <label
                                                    className="fs-13 fw-4 cn-9 ml-10 mb-0"
                                                    htmlFor={`chkValidate-${app.appId}`}
                                                >
                                                    Ignore cache
                                                </label>
                                            </div>
                                        )}
                                    </>
                                )}
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

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className="dc__border-top flex right bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0"
                style={{ width: '75%', minWidth: '1024px', maxWidth: '1200px' }}
            >
                <button className="cta flex h-36" onClick={onClickTriggerBulkCI}>
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <>
                            <PlayIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-8" />
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
                {renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
