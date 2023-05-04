import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { noop } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as PlayIcon } from '../../../../assets/icons/ic-play-medium.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import emptyPreDeploy from '../../../../assets/img/empty-pre-deploy.png'
import notAuthorized from '../../../../assets/img/ic-not-authorized.svg'
import { getCDMaterialList } from '../../../app/service'
import { CDMaterial } from '../../../app/details/triggerView/cdMaterial'
import { DeploymentNodeType, MATERIAL_TYPE } from '../../../app/details/triggerView/types'
import { BulkCDDetailType, BulkCDTriggerType } from '../../AppGroup.types'
import { BULK_CD_MESSAGING, BUTTON_TITLE } from '../../Constants'
import TriggerResponseModal from './TriggerResponseModal'
import { EmptyView } from '../../../app/details/cicdHistory/History.components'
import { CDMaterialResponseType } from '../../../app/types'

export default function BulkCDTrigger({
    stage,
    appList,
    closePopup,
    updateBulkInputMaterial,
    onClickTriggerBulkCD,
    changeTab,
    toggleSourceInfo,
    selectImage,
    responseList,
    isLoading,
    setLoading,
}: BulkCDTriggerType) {
    const ciTriggerDetailRef = useRef<HTMLDivElement>(null)
    const [selectedApp, setSelectedApp] = useState<BulkCDDetailType>(
        appList.find((app) => !app.warningMessage) || appList[0],
    )
    const [unauthorizedAppList, setUnauthorizedAppList] = useState<Record<number, boolean>>({})
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const closeBulkCDModal = (e): void => {
        abortControllerRef.current.abort()
        closePopup(e)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closeBulkCDModal(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            ciTriggerDetailRef.current &&
            !ciTriggerDetailRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closeBulkCDModal(evt)
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

    const getMaterialData = (): void => {
        const _unauthorizedAppList: Record<number, boolean> = {}
        const _CDMaterialPromiseList = []
        abortControllerRef.current = new AbortController()
        for (const appDetails of appList) {
            if (!appDetails.warningMessage) {
                _unauthorizedAppList[appDetails.appId] = false
                _CDMaterialPromiseList.push(
                    getCDMaterialList(appDetails.cdPipelineId, appDetails.stageType, abortControllerRef.current.signal)
                        .then((data) => {
                            return { appId: appDetails.appId, ...data }
                        })
                        .catch((e) => {
                            if (!abortControllerRef.current.signal.aborted) {
                                throw { response: e?.response, appId: appDetails.appId }
                            }
                        }),
                )
            }
        }
        const _cdMaterialResponse: Record<string, CDMaterialResponseType> = {}
        Promise.allSettled(_CDMaterialPromiseList)
            .then((responses) => {
                responses.forEach((response, index) => {
                    if (response.status === 'fulfilled') {
                        _cdMaterialResponse[response.value['appId']] = {
                            approvalUsers: response.value['approvalUsers'],
                            materials: response.value['materials'],
                            userApprovalConfig: response.value['userApprovalConfig'],
                            requestedUserId: response.value['requestedUserId'],
                        }
                        delete _unauthorizedAppList[response.value['appId']]
                    } else {
                        const errorReason = response.reason
                        if (errorReason.code === 403) {
                            _unauthorizedAppList[errorReason['appId']] = true
                        }
                    }
                })
                updateBulkInputMaterial(_cdMaterialResponse)
                setUnauthorizedAppList(_unauthorizedAppList)
                setLoading(false)
            })
            .catch((error) => {
                showError(error)
            })
    }

    useEffect(() => {
        getMaterialData()
    }, [])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-17 pr-20 pb-17 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy to {appList[0].envName}</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={isLoading}
                    onClick={closeBulkCDModal}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const changeApp = (e): void => {
        setSelectedApp(appList[e.currentTarget.dataset.index])
    }

    const renderEmptyView = (): JSX.Element => {
        if (unauthorizedAppList[selectedApp.appId]) {
            return (
                <EmptyView
                    imgSrc={notAuthorized}
                    title={BULK_CD_MESSAGING.unauthorized.title}
                    subTitle={BULK_CD_MESSAGING.unauthorized.subTitle}
                />
            )
        }
        return (
            <EmptyView
                imgSrc={emptyPreDeploy}
                title={`${selectedApp.name}  ${BULK_CD_MESSAGING[stage].title}`}
                subTitle={BULK_CD_MESSAGING[stage].subTitle}
            />
        )
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        const _currentApp = appList.find((app) => app.appId === selectedApp.appId) ?? ({} as BulkCDDetailType)
        return (
            <div className="bulk-ci-trigger">
                <div className="sidebar bcn-0 dc__height-inherit dc__overflow-auto">
                    <div
                        className="dc__position-sticky dc__top-0 bcn-0 dc__border-bottom fw-6 fs-13 cn-9 pt-12 pr-16 pb-12 pl-16"
                        style={{ zIndex: 1 }}
                    >
                        Applications
                    </div>
                    {appList.map((app, index) => (
                        <div
                            key={`app-${app.appId}`}
                            className={`p-16 cn-9 fw-6 fs-13 dc__border-bottom-n1 cursor ${
                                app.appId === selectedApp.appId ? 'dc__window-bg' : ''
                            }`}
                            data-index={index}
                            onClick={changeApp}
                        >
                            {app.name}
                            {app.warningMessage && (
                                <span className="flex left cy-7 fw-4 fs-12">
                                    <Error className="icon-dim-12 warning-icon-y7 mr-4" />
                                    {app.warningMessage}
                                </span>
                            )}
                            {unauthorizedAppList[app.appId] && (
                                <span className="flex left cy-7 fw-4 fs-12">
                                    <UnAuthorized className="icon-dim-12 warning-icon-y7 mr-4" />
                                    {BULK_CD_MESSAGING.unauthorized.title}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="main-content dc__window-bg dc__height-inherit">
                    {selectedApp.warningMessage || unauthorizedAppList[selectedApp.appId] ? (
                        renderEmptyView()
                    ) : (
                        <CDMaterial
                            appId={selectedApp.appId}
                            pipelineId={+selectedApp.cdPipelineId}
                            stageType={selectedApp.stageType}
                            triggerType={selectedApp.triggerType}
                            material={_currentApp.material ?? []}
                            materialType={MATERIAL_TYPE.inputMaterialList}
                            envName={selectedApp.envName}
                            isLoading={isLoading}
                            changeTab={changeTab}
                            triggerDeploy={onClickStartDeploy}
                            onClickRollbackMaterial={noop}
                            closeCDModal={closeBulkCDModal}
                            selectImage={selectImage}
                            toggleSourceInfo={toggleSourceInfo}
                            parentPipelineId={selectedApp.parentPipelineId}
                            parentPipelineType={selectedApp.parentPipelineType}
                            parentEnvironmentName={selectedApp.parentEnvironmentName}
                            userApprovalConfig={_currentApp.userApprovalConfig}
                            requestedUserId={_currentApp.requestedUserId}
                            isFromBulkCD={true}
                        />
                    )}
                </div>
            </div>
        )
    }

    const onClickStartDeploy = (): void => {
        onClickTriggerBulkCD()
    }

    const isDeployDisabled = (): boolean => {
        return appList.every((app) => app.warningMessage || !app.material?.length)
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex right bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width">
                <button
                    className="cta flex h-36"
                    data-testid="deploy-button"
                    onClick={onClickStartDeploy}
                    disabled={isDeployDisabled()}
                >
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <>
                            {stage === DeploymentNodeType.CD ? (
                                <DeployIcon className="icon-dim-16 dc__no-svg-fill mr-8" />
                            ) : (
                                <PlayIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-8" />
                            )}
                            {BUTTON_TITLE[stage]}
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
                        closePopup={closeBulkCDModal}
                        responseList={responseList}
                        isLoading={isLoading}
                        onClickRetryBuild={onClickTriggerBulkCD}
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
