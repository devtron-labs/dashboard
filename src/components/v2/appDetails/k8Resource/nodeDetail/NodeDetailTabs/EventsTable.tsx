import moment from 'moment'
import React from 'react'
import { MESSAGING_UI } from '../../../../../../config/constants'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { EventTableType } from './node.type'
import { TERMINAL_STATUS, TERMINAL_TEXT } from './terminal/constants'

export function EventsTable({ loading, eventsList, isResourceBrowserView, errorValue, reconnect }: EventTableType) {
    const renderEventsTable = () => {
        if (loading) {
            return (
                <MessageUI
                    dataTestId="app-events-container-loading"
                    msg={MESSAGING_UI.FETCHING_EVENTS}
                    icon={MsgUIType.LOADING}
                    size={24}
                    minHeight={isResourceBrowserView ? '200px' : ''}
                />
            )
        } else {
            if (eventsList && eventsList.length > 0) {
                return (
                    <div data-testid="app-events-container" className="cn-0 ">
                        {errorValue?.status === TERMINAL_STATUS.TERMINATED && <div className="pl-20 h-24 flex left pr-20 w-100 bcr-7 cn-0">
                            {TERMINAL_TEXT.POD_TERMINATED}&nbsp; {errorValue.errorReason}&nbsp;
                            <u className="cursor" onClick={reconnect}>
                                 {TERMINAL_TEXT.INITIATE_CONNECTION}
                            </u>
                        </div>}
                        <table className="table pl-20">
                            <thead
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
                                                className={
                                                    'cell-style dc__uppercase ' + head + (idx === 0 && ' pad-left-20')
                                                }
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
                                            className={
                                                'no-events-border pl-20 event-row ' +
                                                (index % 2 === 0 && 'alternate-row')
                                            }
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
            } else {
                return (
                    <MessageUI
                        dataTestId="app-events-container-empty"
                        msg={MESSAGING_UI.NO_EVENTS}
                        size={24}
                        minHeight={isResourceBrowserView ? '200px' : ''}
                    />
                )
            }
        }
    }

    return <>{renderEventsTable()}</>
}
