import React from 'react'
import Tippy from '@tippyjs/react'
import { EVENT_LIST } from '../Constants'
import { EventListType } from '../Types'
import { getScrollableResourceClass } from '../Utils'
import { highlightSearchedText } from '../../common'

export function EventList({
    listRef,
    filteredData,
    handleResourceClick,
    paginatedView,
    syncError,
    searchText,
}: EventListType) {
    return (
        <div>
            <div className="event-list-row fw-6 cn-7 fs-13 dc__border-bottom pl-20 pr-8 pt-8 pb-8 dc__uppercase h-36">
                <div>{EVENT_LIST.headerKeys.type}</div>
                <div>{EVENT_LIST.headerKeys.message}</div>
                <div>{EVENT_LIST.headerKeys.namespace}</div>
                <div>{EVENT_LIST.headerKeys.involvedObject}</div>
                <div>{EVENT_LIST.headerKeys.source}</div>
                <div>{EVENT_LIST.headerKeys.count}</div>
                <div>{EVENT_LIST.headerKeys.age}</div>
                <div>{EVENT_LIST.headerKeys.lastSeen}</div>
            </div>
            <div
                ref={listRef}
                className={getScrollableResourceClass('scrollable-event-list', paginatedView, syncError)}
            >
                {filteredData?.map((eventData, index) => (
                    <div key={`${eventData.type}_${eventData[EVENT_LIST.dataKeys.involvedObject]}_${index}`} className="event-list-row cn-9 fs-13 dc__border-bottom-n1 pl-20 pr-8 pt-12 pb-12 hover-class">
                        <div className={` app-summary__status-name dc__highlight-text f-${eventData.type?.toLowerCase()}`}>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchedText(searchText, eventData.type),
                                }}
                            ></span>
                        </div>
                        <div className="dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchedText(searchText, eventData.message),
                                }}
                            ></span>
                        </div>
                        <div className="dc__ellipsis-right dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchedText(searchText, eventData.namespace),
                                }}
                            ></span>
                        </div>
                        <div className="dc__ellipsis-right dc__highlight-text">
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
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: highlightSearchedText(
                                                searchText,
                                                eventData[EVENT_LIST.dataKeys.involvedObject],
                                            ),
                                        }}
                                    ></span>
                                </a>
                            </Tippy>
                        </div>

                        <div className="dc__ellipsis-right dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchedText(searchText, eventData.source),
                                }}
                            ></span>
                        </div>
                        <div>{eventData.count}</div>
                        <div className="dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchedText(searchText, eventData.age),
                                }}
                            ></span>
                        </div>
                        <div>{eventData[EVENT_LIST.dataKeys.lastSeen]}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
