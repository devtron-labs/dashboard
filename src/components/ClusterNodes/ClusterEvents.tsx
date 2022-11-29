import React, { useState, useEffect } from 'react'
import { showError } from '../common'
import { EventsTable } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Events.table'
import { getclusterEvents } from './clusterNodes.service'

export default function ClusterEvents({ clusterId }){
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState<boolean>()

    useEffect(() => {
        setLoading(true)
        getclusterEvents(clusterId).then((response) => {
            setLoading(false)
            const events = response.result?.events.items
            setEvents(events)
        }).catch((error) => {
            showError(error)
        })
    },[])

    return <EventsTable loading={loading} eventsList={events} />
}