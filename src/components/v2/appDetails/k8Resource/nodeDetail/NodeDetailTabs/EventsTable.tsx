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

import moment from 'moment'
import React from 'react'
import { MESSAGING_UI } from '../../../../../../config/constants'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { EventTableType } from './node.type'
import { TERMINAL_STATUS, TERMINAL_TEXT } from './terminal/constants'
import { AppThemeType, getComponentSpecificThemeClass } from '@devtron-labs/devtron-fe-common-lib'

export const EventsTable = ({ loading, eventsList, isResourceBrowserView, errorValue, reconnect }: EventTableType) => {
    const renderEventsTable = () => {
        if (loading) {
            return (
                <MessageUI
                    dataTestId="app-events-container-loading"
                    msg={MESSAGING_UI.FETCHING_EVENTS}
                    icon={MsgUIType.LOADING}
                    size={24}
                />
            )
        }
        if (eventsList && eventsList.length > 0) {
            return (
                <div
                    data-testid="app-events-container"
                    className={`text__white dc__overflow-auto ${getComponentSpecificThemeClass(AppThemeType.dark)}`}
                    style={{
                        height: isResourceBrowserView ? 'calc(100vh - 119px)' : 'calc(100vh - 155px)',
                    }}
                >
                    {errorValue?.status === TERMINAL_STATUS.TERMINATED && (
                        <div className="pl-20 h-24 flex left pr-20 w-100 bcr-7 cn-0">
                            {TERMINAL_TEXT.POD_TERMINATED}&nbsp; {errorValue.errorReason}&nbsp;
                            <u className="cursor" onClick={reconnect}>
                                {TERMINAL_TEXT.INITIATE_CONNECTION}
                            </u>
                        </div>
                    )}
                    <table className="table pl-20">
                        <thead
                            className="dc__position-sticky dc__top-0"
                            style={{
                                minHeight: isResourceBrowserView ? '200px' : '600px',
                                background: 'var(--terminal-bg)',
                            }}
                        >
                            <tr className="no-events-border pl-20 event-row">
                                {['reason', 'message', 'count', 'last timestamp'].map((head, idx) => {
                                    return (
                                        <th
                                            key={`eh_${idx}`}
                                            className={`cell-style dc__uppercase ${head}${idx === 0 && ' pad-left-20'}`}
                                            data-testid={head}
                                        >
                                            {head}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {eventsList.map((event, index) => {
                                return (
                                    <tr
                                        className={`no-events-border pl-20 event-row ${index % 2 === 0 && 'alternate-row'}`}
                                        key={`eb_${index}`}
                                    >
                                        <td className="cell-style reason pad-left-20">{event.reason}</td>
                                        <td className="cell-style message">{event.message}</td>
                                        <td className="cell-style count">{event.count}</td>
                                        <td className="cell-style timestamp">
                                            {event.lastTimestamp &&
                                                moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss')
                                                    .add(5, 'hours')
                                                    .add(30, 'minutes')
                                                    .format('YYYY-MM-DD HH:mm:ss')}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )
        }
        return (
            <MessageUI
                dataTestId="app-events-container-empty"
                msg={MESSAGING_UI.NO_EVENTS}
                size={24}
            />
        )
    }

    return <>{renderEventsTable()}</>
}
