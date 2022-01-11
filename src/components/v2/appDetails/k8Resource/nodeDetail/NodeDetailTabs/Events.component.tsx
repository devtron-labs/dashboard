import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import IndexStore from '../../../index.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';
import moment from 'moment';
import { NodeType } from '../../../appDetails.type';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';

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
        setLoading(true);

        getEvent(appDetails, params.podName, params.nodeType)
            .then((response) => {
                setEvents(response.result.items || []);
                setLoading(false);
            })
            .catch((err) => {
                console.log('err', err);
                setEvents([]);
                setLoading(false);
            });
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
                                <table
                                    className="events-logs__events-table pl-20"
                                    style={{ minHeight: '600px', background: '#0B0F22' }}
                                >
                                    <thead>
                                        <tr className="no-border events-logs__events-table-row event-header">
                                            {['Reason', 'Message', 'Count', 'Last Timestamp'].map((head, idx) => {
                                                return (
                                                    <th className="pl-20 pr-20" key={`eh_${idx}`}>
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
                                                    className={`${index % 2 === 0 ? 'event__row-bc' : '' } no-border events-logs__events-table-row w-100 mono fs-13`}
                                                    key={`eb_${index}`}
                                                >
                                                    <td className="pl-20 pr-20">{event.reason}</td>
                                                    <td className="pl-20 pr-20">{event.message}</td>
                                                    <td className="pl-20 pr-20">{event.count}</td>
                                                    <td className="pl-20 pr-20">
                                                        {moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss')
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

                        {loading && <MessageUI msg="fetching events" icon={MsgUIType.LOADING} size={24} />}
                    </React.Fragment>
                )
            )}
            {pods.length === 0 && <MessageUI msg="Events not available" size={24} />}
        </div>
    );
}

export default EventsComponent;
