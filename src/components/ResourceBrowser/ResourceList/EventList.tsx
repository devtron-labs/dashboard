import React from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { EventListType } from '../Types'

export function EventList({ filteredData, updateNodeSelectionData }: EventListType) {
    const { nodeType } = useParams<{
        nodeType: string
    }>()
    const { url } = useRouteMatch()
    const { push } = useHistory()
    const handleResourceClick = (e) => {
        const { name, tab, namespace } = e.currentTarget.dataset
        const _url = `${url.split('/').slice(0, -1).join('/')}/${name}${tab ? `/${tab.toLowerCase()}` : ''}`
        const [kind, resourceName] = name.split('/')
        const _name = kind + '_'+ resourceName
        const isAdded = AppDetailsStore.addAppDetailsTab(kind, resourceName, _url)
        if (isAdded) {
            updateNodeSelectionData({ name:_name, namespace , isFromEvent: true})
            push(_url)
        } else {
            toast.error(
                <div>
                    <div>Max 5 tabs allowed</div>
                    <p>Please close an open tab and try again.</p>
                </div>,
            )
        }
    }
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
                                data-name={eventData['involved object']}
                                data-namespace={eventData.namespace}
                                onClick={handleResourceClick}
                            >
                                {eventData['involved object']}
                            </a>
                        </div>

                        <div className="dc__ellipsis-right">{eventData.source}</div>
                        <div>{eventData.count}</div>
                        <div>{eventData.age}</div>
                        <div>{eventData['last seen']}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
