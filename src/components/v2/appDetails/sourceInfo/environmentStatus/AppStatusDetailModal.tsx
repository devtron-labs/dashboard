import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import IndexStore from '../../index.store'
import { AggregatedNodes } from '../../../../app/types'
import { aggregateNodes } from '../../../../app/details/appDetails/utils'
import './environmentStatus.scss'
import { APP_STATUS_CUSTOM_MESSAGES } from '../../../../../config'
import { AppStatusDetailType } from '../../appDetails.type'
import ErrorBar from '../../../../common/error/ErrorBar'
import { NodeStreamMap } from '../environment.type'
import { STATUS_SORTING_ORDER } from './constants'
import AppStatusDetailsChart from './AppStatusDetailsChart'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'

function AppStatusDetailModal({
    close,
    appStreamData,
    showAppStatusMessage,
    title,
    appStatus,
    appStatusText,
    showFooter,
}: AppStatusDetailType) {
    const _appDetails = IndexStore.getAppDetails()

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || [])
    }, [_appDetails])
    const nodesKeyArray = Object.keys(nodes?.nodes || {})
    let flattenedNodes = []
    if (nodesKeyArray.length > 0) {
        for (let index = 0; index < nodesKeyArray.length; index++) {
            const element = nodes.nodes[nodesKeyArray[index]]
            element.forEach((childElement) => {
                childElement.health && flattenedNodes.push(childElement)
            })
        }
        flattenedNodes.sort((a, b) => {
            return (
                STATUS_SORTING_ORDER[a.health.status?.toLowerCase()] -
                STATUS_SORTING_ORDER[b.health.status?.toLowerCase()]
            )
        })
    }
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }
    const [nodeStatusMap, setNodeStatusMap] = useState<Map<string, NodeStreamMap>>()
    const [showSeeMore, setShowSeeMore] = useState(true)

    let message = ''
    const conditions = _appDetails.resourceTree?.conditions
    const Rollout = nodes?.nodes?.Rollout?.entries()?.next().value[1]
    if (
        ['progressing', 'degraded'].includes(_appDetails.resourceTree?.status.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message
    } else if (Rollout?.health?.message) {
        message = Rollout.health.message
    }

    function handleShowMoreButton() {
        setShowSeeMore(!showSeeMore)
    }

    const _hasMoreData = message.length >= 126

    function renderShowMoreButton() {
        return (
            <div onClick={handleShowMoreButton} className="cb-5 fw-6 cursor">
                {showSeeMore ? 'Show More' : 'Show Less'}
            </div>
        )
    }

    const outsideClickHandler = (evt): void => {
        if (
            appStatusDetailRef.current &&
            !appStatusDetailRef.current.contains(evt.target) &&
            typeof close === 'function'
        ) {
            close()
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

    return (
        <Drawer position="right" width="1024px">
            <div className="app-status-detail-modal bcn-0" ref={appStatusDetailRef}>
                <div className="app-status-detail__header dc__box-shadow pt-12 pr-20 pb-12 pl-20 bcn-0 flex dc__content-space">
                    <div>
                        <div data-testid="app-status-details-title" className="title cn-9 fs-16 fw-6 mb-4">
                            {title ? title : 'App status detail'}
                        </div>
                        <div
                            data-testid="app-status-details-subtitle"
                            className={`subtitle app-summary__status-name fw-6 fs-13 f-${
                                appStatus ? appStatus : _appDetails.resourceTree?.status.toLowerCase()
                            } mr-16`}
                        >
                            {appStatusText ? appStatusText : _appDetails.resourceTree?.status.toUpperCase()}
                        </div>
                    </div>
                    <span className="cursor" onClick={close} data-testid="app-status-details-cross">
                        <Close className="icon-dim-24" />
                    </span>
                </div>

                <div className="app-status-detail__body">
                    <ErrorBar appDetails={_appDetails} />

                    {message && (
                        <div
                            className={` ${
                                showSeeMore ? 'app-status__message-wrapper' : ''
                            } bcn-1 cn-9 pt-10 pb-10 pl-20 pr-20`}
                        >
                            <span className="fw-6 ">Message: </span> {message}
                            {_hasMoreData && renderShowMoreButton()}
                        </div>
                    )}

                    {showAppStatusMessage && (
                        <div className="bcn-1 cn-9 pt-10 pb-10 pl-20 pr-20">
                            <span className="fw-6 ">Message: </span>
                            {APP_STATUS_CUSTOM_MESSAGES[_appDetails.resourceTree?.status.toUpperCase()]}
                        </div>
                    )}
                    <AppStatusDetailsChart appStreamData={appStreamData} showFooter={showFooter} />
                </div>
            </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
