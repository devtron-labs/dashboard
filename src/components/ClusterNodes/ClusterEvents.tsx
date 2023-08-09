import React, { useState, useEffect } from 'react'
import { MESSAGING_UI } from '../../config'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
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

    const fetchEvents = async () => {
        try {
            const response = await getClusterEvents(terminalAccessId)
            setErrorValue(response.result)
            setEvents(response.result?.eventsResponse?.events.items || [])
        } catch (error) {
            showError(error)
            setEvents([])
        } finally {
            setLoading(false)
            setTimeout(fetchEvents, 5000)
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
    }, [isResourceMissing])

    return isResourceMissing ? (
        <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
    ) : (
        <EventsTable loading={loading} eventsList={events} errorValue={errorValue} reconnect={reconnectStart} />
    )
}
