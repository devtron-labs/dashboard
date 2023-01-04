import React from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { EVENT_LIST_KEYS } from '../Constants'
import { EventListType } from '../Types'

export function EventList({ filteredData, updateNodeSelectionData, handleResourceClick }: EventListType) {
    const { nodeType } = useParams<{
        nodeType: string
    }>()
    const { url } = useRouteMatch()
    const { push } = useHistory()

    return (
        <div>
            <div className="event-list-row fw-6 cn-7 fs-13 dc__border-bottom pl-20 pr-8 pt-12 pb-12 dc__uppercase">
                <div>Type</div>
                <div>Message</div>
                <div>Namespace</div>
                <div>Involved Object</div>
                <div>Source</div>
                <div>Count</div>
                <div>Age</div>
                <div>Last Seen</div>
            </div>
            <div className="scrollable-event-list">
                {filteredData?.map((eventData) => (
                    <div className="event-list-row cn-9 fs-13 dc__border-bottom-n1 pl-20 pr-8 pt-12 pb-12">
                        <div className={` app-summary__status-name f-${eventData.type?.toLowerCase()}`}>
                            {eventData.type}
                        </div>
                        <div>{eventData.message}</div>
                        <div className="dc__ellipsis-right">{eventData.namespace}</div>
                        <div className="dc__ellipsis-right">
                            <a
                                className="dc__link cursor"
                                data-name={eventData[EVENT_LIST_KEYS.involvedObject]}
                                data-namespace={eventData.namespace}
                                data-origin={'event'}
                                onClick={handleResourceClick}
                            >
                                {eventData[EVENT_LIST_KEYS.involvedObject]}
                            </a>
                        </div>

                        <div className="dc__ellipsis-right">{eventData.source}</div>
                        <div>{eventData.count}</div>
                        <div>{eventData.age}</div>
                        <div>{eventData[EVENT_LIST_KEYS.lastSeen]}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
