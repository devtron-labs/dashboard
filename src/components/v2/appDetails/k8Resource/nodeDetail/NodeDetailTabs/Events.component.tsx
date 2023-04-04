import React, { useEffect, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router'
import IndexStore from '../../../index.store'
import { NodeDetailTab } from '../nodeDetail.type'
import { getEvent } from '../nodeDetail.api'
import { ResourceInfoActionPropsType, NodeType } from '../../../appDetails.type'
import MessageUI from '../../../../common/message.ui'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { EventsTable } from './EventsTable'
import { MESSAGING_UI } from '../../../../../../config/constants'

function EventsComponent({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
}: ResourceInfoActionPropsType) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string }>()
    const { url } = useRouteMatch()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const appDetails = IndexStore.getAppDetails()
    const pods = IndexStore.getNodesByKind(NodeType.Pod)

    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS, url)

        if (!appDetails) {
            //Refresh case -- need to sent to k8 , histrory push
        }
    }, [params.podName, params.node])

    useEffect(() => {
        if (isDeleted) return

        try {
            getEvent(appDetails, params.podName, params.nodeType, isResourceBrowserView, selectedResource)
                .then((response) => {
                    setEvents(response.result.items || (response.result.events && response.result.events.items) || [])
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
    }, [params.podName, params.node, params.nodeType])

    return (
        <div
            className="events-table-container"
            style={{ minHeight: isResourceBrowserView ? '200px' : '600px', background: 'var(--terminal-bg)', flex: 1 }}
        >
            {isDeleted ? (
                <div>
                    <MessageUI
                        msg={MESSAGING_UI.NO_RESOURCE}
                        size={32}
                        minHeight={isResourceBrowserView ? '200px' : ''}
                    />
                </div>
            ) : (
                (isResourceBrowserView || (pods && pods.length > 0)) && (
                    <EventsTable loading={loading} eventsList={events} isResourceBrowserView={isResourceBrowserView} />
                )
            )}
            {!isResourceBrowserView && pods.length === 0 && <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />}
        </div>
    )
}

export default EventsComponent
