import React, { useContext, useEffect, useRef, useState } from 'react'
import { Drawer, noop, Progressing, showError, useAsync } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as PlayIcon } from '../../../../assets/icons/ic-play-medium.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { ModuleNameMap, URLS } from '../../../../config'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { getCIMaterialList } from '../../../app/service'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { WebhookPayloads } from '../../../app/details/triggerView/types'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'

interface AppWorkflowDetailsType {
    workFlowId: number
    appId: number
    name: string
    ciPipelineName: string
    ciPipelineId: string
    isFirstTrigger: boolean
    isCacheAvailable: boolean
    isLinkedCI: boolean
    parentAppId: string
    parentCIPipelineId: boolean
    material: any[]
    notFoundMessage: string
    isHideSearchHeader: boolean
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
    const [selectedApp, setSelectedApp] = useState<AppWorkflowDetailsType>(
        appList.find((app) => !app.notFoundMessage) || appList[0],
    )
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
            appDetails.notFoundMessage
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
                    setShowRegexModal(
                        isShowRegexModal(
                            selectedApp.appId,
                            +selectedApp.ciPipelineId,
                            _materialListMap[selectedApp.appId],
                        ),
                    )
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

    const changeApp = (e): void => {
        const _selectedApp = appList[e.currentTarget.dataset.index]
        if (_selectedApp.notFoundMessage) {
            return
        }
        setSelectedApp(_selectedApp)
        setShowRegexModal(isShowRegexModal(_selectedApp.appId, +_selectedApp.ciPipelineId, _selectedApp.material))
    }

    const renderMainContent = (selectedMaterialList: any[]): JSX.Element => {
        if (showRegexModal) {
            return <>Regex modal</>
        } else if (selectedMaterialList) {
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
                    onClickShowBranchRegexModal={noop}
                    isFromEnv={true}
                    appId={selectedApp.appId}
                    isFromBulkCI={true}
                    isHideSearchHeader={selectedApp.isHideSearchHeader}
                />
            )
        } else {
            return (
                <EmptyView
                    title="This is a Linked CI Pipeline"
                    subTitle="This is a Linked CI Pipeline"
                    link={`${URLS.APP}/${selectedApp.parentAppId}/${URLS.APP_CI_DETAILS}/${selectedApp.parentCIPipelineId}`}
                    linkText="View Source Pipeline"
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
                    <div className="sidebar bcn-0">
                        {appList.map((app, index) =>
                            app.appId === selectedApp.appId && !app.notFoundMessage ? (
                                <div className="material-list pr-12 pl-12 dc__window-bg" key={`app-${index}`}>
                                    <div className="fw-6 fs-13 cn-9 pt-12 pb-12">{app.name}</div>
                                    {selectedMaterialList && (
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
                                    {!selectedApp.isLinkedCI && (
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
                                </div>
                            ) : (
                                <div
                                    key={`app-${index}`}
                                    className="p-16 cn-9 fw-6 fs-13 dc__border-bottom-n1 cursor"
                                    data-index={index}
                                    onClick={changeApp}
                                >
                                    {app.name}
                                    {app.notFoundMessage && (
                                        <span className="flex left cy-7 fw-4 fs-12">
                                            <Error className="icon-dim-12 warning-icon-y7 mr-4" />
                                            {app.notFoundMessage}
                                        </span>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                )}
                <div className="main-content dc__window-bg">{renderMainContent(selectedMaterialList)}</div>
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
