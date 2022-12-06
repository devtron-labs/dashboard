import React, { useState, useEffect } from 'react'
import { showError } from '../common'
import { EventsTable } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Events.table'
import MessageUI from '../v2/common/message.ui'
import { getclusterEvents } from './clusterNodes.service'

export default function ClusterEvents({ clusterId }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState<boolean>()
    const [isResourceMissing, setIsResourceMissing] = useState(false)

    useEffect(() => {
        if (clusterId) {
            setLoading(true)
            getclusterEvents(clusterId)
                .then((response) => {
                    setLoading(false)
                    const events = response.result?.events.items
                    setEvents(events)
                })
                .catch((error) => {
                    showError(error)
                    setLoading(false)
                })
        } else {
            setIsResourceMissing(true)
            setLoading(false)
        }
    }, [])

    return isResourceMissing ? (
        <MessageUI msg="Manifest not available" size={24} />
    ) : (
        <EventsTable loading={loading} eventsList={events} />
    )
}
