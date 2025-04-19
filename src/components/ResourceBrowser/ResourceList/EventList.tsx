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
import DOMPurify from 'dompurify'

import { highlightSearchText, Tooltip, WidgetEventDetails } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { EVENT_LIST } from '../Constants'
import { EventListType } from '../Types'

const ExplainEventButton = importComponentFromFELibrary('ExplainEventButton', null, 'function')

export const EventList = ({
    listRef,
    filteredData,
    handleResourceClick,
    searchText,
    setWidgetEventDetails,
}: EventListType) => (
    <div className="dc__overflow-auto">
        <div ref={listRef} className="scrollable-event-list dc__min-width-fit-content flexbox-col">
            <div
                className={`event-list-row${ExplainEventButton ? '__explain' : ''} dc__zi-1 dc__min-width-fit-content dc__position-sticky bg__primary dc__top-0 fw-6 cn-7 fs-13 dc__border-bottom px-20 py-8 dc__uppercase h-36`}
            >
                {Object.values(EVENT_LIST.headerKeys).map((title) => (
                    <div>
                        <Tooltip key={title} content={title} alwaysShowTippyOnHover>
                            <span className="dc__ellipsis-right">{title}</span>
                        </Tooltip>
                    </div>
                ))}
            </div>
            {filteredData?.map((eventData) => {
                const eventDetails: WidgetEventDetails = {
                    message: eventData.message as string,
                    namespace: eventData.namespace as string,
                    object: eventData[EVENT_LIST.dataKeys.involvedObject] as string,
                    source: eventData.source as string,
                    age: eventData.age as string,
                    count: eventData.count as number,
                    lastSeen: eventData[EVENT_LIST.dataKeys.lastSeen] as string,
                }
                const handleExplainEventClick = () => {
                    setWidgetEventDetails(eventDetails)
                }
                return (
                    <div
                        key={Object.values(eventData).join('-')}
                        className={`event-list-row${ExplainEventButton ? '__explain' : ''} cn-9 fs-13 dc__border-bottom-n1 px-20 py-12 hover-class`}
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
                        <Tooltip content={eventData.namespace}>
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
                        </Tooltip>
                        <div className="flexbox dc__align-start">
                            <Tooltip content={eventData[EVENT_LIST.dataKeys.involvedObject]}>
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
                            </Tooltip>
                        </div>
                        <Tooltip content={eventData.source}>
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
                        </Tooltip>
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
                        {ExplainEventButton && eventData.type === 'Warning' ? (
                            <ExplainEventButton handleExplainEventClick={handleExplainEventClick} />
                        ) : (
                            <span />
                        )}
                    </div>
                )
            })}
        </div>
    </div>
)
