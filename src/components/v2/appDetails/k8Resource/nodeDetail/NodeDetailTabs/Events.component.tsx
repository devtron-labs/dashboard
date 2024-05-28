import React, { useEffect, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import IndexStore from '../../../index.store'
import { NodeDetailTab } from '../nodeDetail.type'
import { getEvent } from '../nodeDetail.api'
import { ResourceInfoActionPropsType, NodeType } from '../../../appDetails.type'
import MessageUI from '../../../../common/message.ui'
import { EventsTable } from './EventsTable'
import { MESSAGING_UI } from '../../../../../../config/constants'

const EventsComponent = ({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
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
        } catch (err) {
            setEvents([])
            setLoading(false)
        }
    }, [params.podName, params.node, params.nodeType, params.namespace])

    const renderContent = () => {
        if (isDeleted) {
            return (
                <div>
                    <MessageUI
                        msg={MESSAGING_UI.NO_RESOURCE}
                        size={32}
                        minHeight={isResourceBrowserView ? '200px' : ''}
                    />
                </div>
            )
        }

        if (events.length) {
            return <EventsTable loading={loading} eventsList={events} isResourceBrowserView={isResourceBrowserView} />
        }

        return <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
    }

    return (
        <div
            className="events-table-container"
            style={{ minHeight: isResourceBrowserView ? '200px' : '600px', background: 'var(--terminal-bg)', flex: 1 }}
        >
            {renderContent()}
        </div>
    )
}

export default EventsComponent
