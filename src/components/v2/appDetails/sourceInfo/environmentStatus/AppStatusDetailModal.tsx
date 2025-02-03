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

import { useMemo, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import IndexStore from '../../index.store'
import { AggregatedNodes } from '../../../../app/types'
import './environmentStatus.scss'
import { APP_STATUS_CUSTOM_MESSAGES } from '../../../../../config'
import { AppStatusDetailType } from '../../appDetails.type'
import { STATUS_SORTING_ORDER } from './constants'
import {
    Drawer,
    AppStatusDetailsChart,
    ErrorBar,
    aggregateNodes,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

const AppStatusDetailModal = ({
    close,
    showAppStatusMessage,
    title,
    appStatus,
    appStatusText,
    showFooter,
    setShowConfigDriftModal,
}: AppStatusDetailType) => {
    const _appDetails = IndexStore.getAppDetails()

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || [])
    }, [_appDetails])
    const nodesKeyArray = Object.keys(nodes?.nodes || {})
    const flattenedNodes = []
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
    const [showSeeMore, setShowSeeMore] = useState(true)

    let message = ''
    const conditions = _appDetails.resourceTree?.conditions
    const Rollout = nodes?.nodes?.Rollout?.entries()?.next().value[1]
    if (Array.isArray(conditions) && conditions.length > 0 && conditions[0].message) {
        message = conditions[0].message
    } else if (Rollout?.health?.message) {
        message = Rollout.health.message
    } else if (_appDetails.FluxAppStatusDetail) {
        message = _appDetails.FluxAppStatusDetail.message
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

    return (
        <Drawer position="right" width="1024px" onClose={close}>
            <div className="app-status-detail-modal bg__primary" onClick={stopPropagation}>
                <div className="app-status-detail__header dc__box-shadow pt-12 pr-20 pb-12 pl-20 bg__primary flex dc__content-space">
                    <div>
                        <div data-testid="app-status-details-title" className="title cn-9 fs-16 fw-6 mb-4">
                            {title || 'App status detail'}
                        </div>
                        <div
                            data-testid="app-status-details-subtitle"
                            className={`subtitle app-summary__status-name fw-6 fs-13 f-${
                                appStatus || _appDetails.resourceTree?.status?.toLowerCase()
                            } mr-16`}
                        >
                            {appStatusText || _appDetails.resourceTree?.status?.toUpperCase() || _appDetails.appStatus}
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
                    <AppStatusDetailsChart
                        showFooter={showFooter}
                        onClose={close}
                        setShowConfigDriftModal={setShowConfigDriftModal}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
