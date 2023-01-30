import React from 'react'
import Tippy from '@tippyjs/react'
import { EVENT_LIST } from '../Constants'
import { EventListType } from '../Types'

export function EventList({ listRef, filteredData, handleResourceClick, paginatedView }: EventListType) {
    return (
        <div>
            <div className="event-list-row fw-6 cn-7 fs-13 dc__border-bottom pl-20 pr-8 pt-12 pb-12 dc__uppercase">
                <div>{EVENT_LIST.headerKeys.type}</div>
                <div>{EVENT_LIST.headerKeys.message}</div>
                <div>{EVENT_LIST.headerKeys.namespace}</div>
                <div>{EVENT_LIST.headerKeys.involvedObject}</div>
                <div>{EVENT_LIST.headerKeys.source}</div>
                <div>{EVENT_LIST.headerKeys.count}</div>
                <div>{EVENT_LIST.headerKeys.age}</div>
                <div>{EVENT_LIST.headerKeys.lastSeen}</div>
            </div>
            <div ref={listRef} className={`scrollable-event-list ${paginatedView ? 'paginated-list-view' : ''}`}>
                {filteredData?.map((eventData) => (
                    <div className="event-list-row cn-9 fs-13 dc__border-bottom-n1 pl-20 pr-8 pt-12 pb-12">
                        <div className={` app-summary__status-name f-${eventData.type?.toLowerCase()}`}>
                            {eventData.type}
                        </div>
                        <div>{eventData.message}</div>
                        <div className="dc__ellipsis-right">{eventData.namespace}</div>
                        <div className="dc__ellipsis-right">
                            <Tippy
                                className="default-tt"
                                placement="left"
                                arrow={false}
                                content={eventData[EVENT_LIST.dataKeys.involvedObject]}
                            >
                                <a
                                    className="dc__link cursor"
                                    data-name={eventData[EVENT_LIST.dataKeys.involvedObject]}
                                    data-namespace={eventData.namespace}
                                    data-origin="event"
                                    onClick={handleResourceClick}
                                >
                                    {eventData[EVENT_LIST.dataKeys.involvedObject]}
                                </a>
                            </Tippy>
                        </div>

                        <div className="dc__ellipsis-right">{eventData.source}</div>
                        <div>{eventData.count}</div>
                        <div>{eventData.age}</div>
                        <div>{eventData[EVENT_LIST.dataKeys.lastSeen]}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
