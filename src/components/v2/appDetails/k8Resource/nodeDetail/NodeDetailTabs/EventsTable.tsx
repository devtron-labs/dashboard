import moment from 'moment'
import React from 'react'
import { MESSAGING_UI } from '../../../../../../config/constants'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { EventTableType } from './node.type'

export function EventsTable({ loading, eventsList }: EventTableType) {
    const renderEventsTable = () => {
        if (loading) {
            return <MessageUI msg={MESSAGING_UI.FETCHING_EVENTS} icon={MsgUIType.LOADING} size={24} />
        } else {
            if (eventsList && eventsList.length > 0) {
                return (
                    <div className="cn-0 ">
                        <table className="table pl-20">
                            <thead style={{ minHeight: '600px', background: '#0B0F22' }}>
                                <tr className="no-events-border pl-20 event-row">
                                    {['reason', 'message', 'count', 'last timestamp'].map((head, idx) => {
                                        return (
                                            <th
                                                key={`eh_${idx}`}
                                                className={
                                                    'cell-style dc__uppercase ' + head + (idx === 0 && ' pad-left-20')
                                                }
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
                return <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />
            }
        }
    }

    return <>{renderEventsTable()}</>
}
