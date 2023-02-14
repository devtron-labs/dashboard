import React, { useState, useEffect } from 'react'
import { MESSAGING_UI } from '../../config'
import { showError } from '../common'
import { EventsTable } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/EventsTable'
import { PodEventsType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/node.type'
import MessageUI from '../v2/common/message.ui'
import { getClusterEvents } from './clusterNodes.service'

export default function ClusterEvents({
    terminalAccessId,
    reconnectStart,
}: {
    terminalAccessId: number
    reconnectStart?: () => void
}) {
    const [events, setEvents] = useState<PodEventsType>()
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)

    useEffect(() => {
        if (terminalAccessId) {
            getClusterEvents(terminalAccessId)
                .then((response) => {
                    setLoading(false)
                    const events = response.result
                    setEvents(events)
                })
                .catch((error) => {
                    showError(error)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setResourceMissing(true)
            setLoading(false)
        }
    }, [])

    return isResourceMissing ? (
        <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
    ) : (
        <EventsTable
            loading={loading}
            eventsList={events?.eventsResponse?.events.items}
            errorValue={events}
            reconnect={reconnectStart}
        />
    )
}
