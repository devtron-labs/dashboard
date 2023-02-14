import React, { useContext, useEffect, useRef, useState } from 'react'
import { Drawer, Progressing, useAsync } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as PlayIcon } from '../../../../assets/icons/ic-play-medium.svg'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { ModuleNameMap } from '../../../../config'
import MaterialSource from '../../../app/details/triggerView/MaterialSource'
import { TriggerViewContext } from '../../../app/details/triggerView/config'
import { getCIMaterialList } from '../../../app/service'

interface BulkCITriggerType {
    appList: { id: number; name: string; ciPipelineName: string; ciPipelineId: string }[]
    appId: string
    envId: number
    closePopup: (e) => void
}

export default function BulkCITrigger({ appList, appId, envId, closePopup }: BulkCITriggerType) {
    const ciTriggerDetailRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(true)
    const [selectedAppID, setSelectedAppID] = useState<number>(appList[0].id)
    const [materialList, setMaterialList] = useState<Record<string, any[]>>(null)
    const [, blobStorageConfiguration] = useAsync(() => getModuleConfigured(ModuleNameMap.BLOB_STORAGE), [appId])
    const {
        selectMaterial,
        refreshMaterial,
    }: {
        selectMaterial: (materialId) => void
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

    const getMaterialData = (): void => {
        const _CIMaterialPromiseList = appList?.map((appDetails) =>
            getCIMaterialList({
                pipelineId: appDetails.ciPipelineId,
            }),
        )
        const _materialListMap: Record<string, any[]> = {}
        Promise.allSettled(_CIMaterialPromiseList).then(
            (responses: { status: string; value?: any; reason?: any }[]) => {
                responses.forEach((res, index) => {
                    _materialListMap[appList[index]?.id] = res.value['result']
                })
                setMaterialList(_materialListMap)
                setLoading(false)
            },
        )
    }

    useEffect(() => {
        getMaterialData()
    }, [])

    const renderHeaderSection = (): JSX.Element => {
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
        setSelectedAppID(+e.currentTarget.dataset.appId)
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="bulk-ci-trigger">
                <div className="sidebar bcn-0">
                    {appList.map((app) =>
                        app.id === selectedAppID ? (
                            <div className="material-list pr-12 pl-12 dc__window-bg">
                                <div className="fw-6 fs-13 cn-9 mt-12 mb-12">{app.name}</div>
                                <MaterialSource
                                    material={materialList[app.id]}
                                    selectMaterial={selectMaterial}
                                    refreshMaterial={{
                                        refresh: refreshMaterial,
                                        title: app.ciPipelineName,
                                        pipelineId: +app.ciPipelineId,
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                className="p-16 cn-9 fw-6 fs-13 dc__border-bottom-n1 cursor"
                                data-app-id={app.id}
                                onClick={changeApp}
                            >
                                {app.name}
                            </div>
                        ),
                    )}
                </div>
                <div className="main-content dc__window-bg">

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
                <button
                    className="cta flex h-36"
                    onClick={() => {
                        alert('hey CI')
                    }}
                >
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <>
                            <PlayIcon className="icon-dim-16 dc__no-svg-fill scb-1 mr-8" />
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
