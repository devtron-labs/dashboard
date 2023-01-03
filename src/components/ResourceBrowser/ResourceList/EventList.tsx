import React from 'react'
import { EventListType } from '../Types'

export function EventList({ filteredData }: EventListType) {
    return (
        <div>
            <div className="event-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
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
                    <div className="event-list-row cn-9 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20">
                        <div>{eventData.type}</div>
                        <div className="dc__ellipsis-right">{eventData.message}</div>
                        <div className="dc__ellipsis-right">{eventData.namespace}</div>
                        <div className="dc__ellipsis-right">{eventData['involved object']}</div>
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
