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

import React, { useState, useEffect } from 'react'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { MESSAGING_UI } from '../../config'
import { EventsTable } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/EventsTable'
import { PodEventsType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/node.type'
import MessageUI from '../v2/common/message.ui'
import { getClusterEvents } from './clusterNodes.service'
import { ClusterEventsType } from './types'

export default function ClusterEvents({ terminalAccessId, reconnectStart }: ClusterEventsType) {
    const [events, setEvents] = useState([])
    const [errorValue, setErrorValue] = useState<PodEventsType>()
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)
    let timeoutId

    const fetchEvents = async () => {
        try {
            const response = await getClusterEvents(terminalAccessId)
            setErrorValue(response.result)
            /* Sorting the EventList object on the basis of Last TimeStamp. */
            const eventResult = response.result?.eventsResponse?.events.items || []
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
        } catch (error) {
            showError(error)
            setEvents([])
        } finally {
            setLoading(false)
            if (!isResourceMissing && terminalAccessId) {
                timeoutId = setTimeout(fetchEvents, 5000)
            }
        }
    }

    useEffect(() => {
        if (!isResourceMissing && terminalAccessId) {
            setLoading(true)
            fetchEvents()
        } else {
            setResourceMissing(true)
            setLoading(false)
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [isResourceMissing, terminalAccessId])

    return isResourceMissing ? (
        <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
    ) : (
        <EventsTable loading={loading} eventsList={events} errorValue={errorValue} reconnect={reconnectStart} />
    )
}
