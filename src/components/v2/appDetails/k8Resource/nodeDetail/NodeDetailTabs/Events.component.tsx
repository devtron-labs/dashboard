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

import { useEffect, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import { showError } from '@devtron-labs/devtron-fe-common-lib'

import { MESSAGING_UI } from '../../../../../../config/constants'
import MessageUI from '../../../../common/message.ui'
import { ResourceInfoActionPropsType } from '../../../appDetails.type'
import IndexStore from '../../../index.store'
import { getEvent } from '../nodeDetail.api'
import { NodeDetailTab } from '../nodeDetail.type'
import { EventsTable } from './EventsTable'

const EventsComponent = ({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
    clusterId,
    aiWidgetEventDetails,
}: ResourceInfoActionPropsType) => {
    const params = useParams<{
        actionName: string
        podName: string
        nodeType: string
        node: string
        namespace: string
    }>()
    const { url } = useRouteMatch()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const appDetails = IndexStore.getAppDetails()

    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS, url)
    }, [params.podName, params.node, params.namespace])

    useEffect(() => {
        if (isDeleted) {
            return
        }

        try {
            getEvent(appDetails, params.podName, params.nodeType, isResourceBrowserView, selectedResource)
                .then((response) => {
                    /* Sorting the EventList object on the basis of Last TimeStamp. */
                    const eventResult =
                        response.result.items || (response.result.events && response.result.events.items) || []
                    eventResult.sort((a, b) => {
                        if (a.lastTimestamp > b.lastTimestamp) {
                            return -1
                        }
                        if (a.lastTimestamp < b.lastTimestamp) {
                            return 1
                        }
                        return 0
                    })
                    setEvents(eventResult)
                    setLoading(false)
                })
                .catch((err) => {
                    showError(err)
                    setEvents([])
                    setLoading(false)
                })
        } catch {
            setEvents([])
            setLoading(false)
        }
    }, [params.podName, params.node, params.nodeType, params.namespace])

    const renderContent = () => {
        if (isDeleted) {
            return <MessageUI msg={MESSAGING_UI.NO_RESOURCE} size={32} />
        }

        if (events.length) {
            return (
                <EventsTable
                    loading={loading}
                    eventsList={events}
                    clusterId={clusterId}
                    aiWidgetAnalyticsEvent={aiWidgetEventDetails}
                />
            )
        }

        return <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
    }

    return (
        <div className="flex-grow-1 flexbox-col dc__overflow-auto" style={{ background: 'var(--terminal-bg)' }}>
            {renderContent()}
        </div>
    )
}

export default EventsComponent
