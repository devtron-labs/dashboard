/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable react/no-danger */
import Tippy from '@tippyjs/react'
import DOMPurify from 'dompurify'
import { highlightSearchText } from '@devtron-labs/devtron-fe-common-lib'
import { EVENT_LIST } from '../Constants'
import { EventListType } from '../Types'
import { getScrollableResourceClass } from '../Utils'

export const EventList = ({
    listRef,
    filteredData,
    handleResourceClick,
    paginatedView,
    syncError,
    searchText,
}: EventListType) => {
    return (
        <div className="dc__overflow-scroll">
            <div className="event-list-row dc__zi-5 dc__min-width-fit-content dc__position-sticky bcn-0 dc__top-0 fw-6 cn-7 fs-13 dc__border-bottom pl-20 pr-8 pt-8 pb-8 dc__uppercase h-36">
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
                className={`${getScrollableResourceClass('scrollable-event-list', paginatedView, syncError)} dc__min-width-fit-content`}
            >
                {filteredData?.map((eventData) => (
                    <div
                        key={Object.values(eventData).join('-')}
                        className="event-list-row cn-9 fs-13 dc__border-bottom-n1 pl-20 pr-8 pt-12 pb-12 hover-class"
                    >
                        <div
                            className={`app-summary__status-name dc__highlight-text f-${(eventData.type as string)?.toLowerCase()}`}
                        >
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: eventData.type as string,
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </div>
                        <div className="dc__highlight-text dc__break-word">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: eventData.message as string,
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </div>
                        <div className="dc__ellipsis-right dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: eventData.namespace as string,
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </div>
                        <div className="flexbox dc__align-start">
                            <Tippy
                                className="default-tt"
                                placement="left"
                                arrow={false}
                                content={eventData[EVENT_LIST.dataKeys.involvedObject]}
                            >
                                <button
                                    type="button"
                                    className="dc__unset-button-styles dc__ellipsis-right"
                                    data-name={eventData[EVENT_LIST.dataKeys.involvedObject]}
                                    data-namespace={eventData.namespace}
                                    data-origin="event"
                                    onClick={handleResourceClick}
                                    aria-label="Select event involved object"
                                >
                                    <span
                                        className="dc__link cursor"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                highlightSearchText({
                                                    searchText,
                                                    text: eventData[EVENT_LIST.dataKeys.involvedObject] as string,
                                                    highlightClasses: 'p-0 fw-6 bcy-2',
                                                }),
                                            ),
                                        }}
                                    />
                                </button>
                            </Tippy>
                        </div>

                        <div className="dc__ellipsis-right dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: eventData.source as string,
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </div>
                        <div>{eventData.count}</div>
                        <div className="dc__highlight-text">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        highlightSearchText({
                                            searchText,
                                            text: eventData.age as string,
                                            highlightClasses: 'p-0 fw-6 bcy-2',
                                        }),
                                    ),
                                }}
                            />
                        </div>
                        <div>{eventData[EVENT_LIST.dataKeys.lastSeen]}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
