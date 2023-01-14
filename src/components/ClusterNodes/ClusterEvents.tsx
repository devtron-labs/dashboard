import React, { useState, useEffect } from 'react'
import { MESSAGING_UI } from '../../config'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { EventsTable } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/EventsTable'
import MessageUI from '../v2/common/message.ui'
import { getClusterEvents } from './clusterNodes.service'

export default function ClusterEvents({ terminalAccessId }: { terminalAccessId: number }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)

    useEffect(() => {
        if (terminalAccessId) {
            getClusterEvents(terminalAccessId)
                .then((response) => {
                    setLoading(false)
                    const events = response.result?.events.items
                    setEvents(events)
                })
                .catch((error) => {
                    showError(error)
                }).finally(() => {
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
        <EventsTable loading={loading} eventsList={events} />
    )
}
