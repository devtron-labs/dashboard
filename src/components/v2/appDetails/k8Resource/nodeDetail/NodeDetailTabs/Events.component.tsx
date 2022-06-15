import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import IndexStore from '../../../index.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';
import moment from 'moment';
import { NodeType } from '../../../appDetails.type';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';
import { showError } from '../../../../../common';

function EventsComponent({ selectedTab, isDeleted }) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const { url } = useRouteMatch();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const appDetails = IndexStore.getAppDetails();
    const [podName, setPodName] = useState(params.podName);
    const pods = IndexStore.getNodesByKind(NodeType.Pod);

    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS, url);

        if (!appDetails) {
            //Refresh case -- need to sent to k8 , histrory push
        }
    }, [params.podName]);

    useEffect(() => {
        try {
            getEvent(appDetails, params.podName, params.nodeType)
            .then((response) => {
                setEvents(response.result.items || (response.result.events && response.result.events.items) || []);
                setLoading(false);
            })
            .catch((err) => {
                showError(err)
                setEvents([]);
                setLoading(false);
            });
        } catch (error) {
            setEvents([]);
            setLoading(false);
        }
    }, [params.podName, params.nodeType]);

    return (
        <div style={{ minHeight: '600px', background: '#0B0F22', flex: 1 }}>
            {isDeleted ? (
                <div>
                    <MessageUI msg="This resource no longer exists" size={32} />
                </div>
            ) : (
                pods &&
                pods.length > 0 && (
                    <React.Fragment>
                        {!loading && events && events.length > 0 && (
                            <div className="cn-0 ">
                                <table className="table pl-20">
                                    <thead style={{ minHeight: '600px', background: '#0B0F22' }}>
                                        <tr className="no-events-border pl-20 event-row">
                                            {['reason', 'message', 'count', 'last timestamp'].map((head, idx) => {
                                                return (
                                                    <th
                                                        key={`eh_${idx}`}
                                                        className={
                                                            'cell-style text-uppercase ' +
                                                            head +
                                                            (idx === 0 && ' pad-left-20')
                                                        }
                                                    >
                                                        {head}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((event, index) => {
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
                                                        {event.lastTimestamp && moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss')
                                                            .add(5, 'hours')
                                                            .add(30, 'minutes')
                                                            .format('YYYY-MM-DD HH:mm:ss')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && (!events || events.length === 0) && (
                            <MessageUI msg="Events not available" size={24} />
                        )}

                        {loading && <MessageUI msg="Fetching events" icon={MsgUIType.LOADING} size={24} />}
                    </React.Fragment>
                )
            )}
            {pods.length === 0 && <MessageUI msg="Events not available" size={24} />}
        </div>
    );
}

export default EventsComponent;
