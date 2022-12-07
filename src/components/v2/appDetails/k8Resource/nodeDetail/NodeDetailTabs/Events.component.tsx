import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import IndexStore from '../../../index.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';
import { NodeType } from '../../../appDetails.type';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';
import { showError } from '../../../../../common';
import { EventsTable } from './EventsTable';
import { MESSAGING_UI } from '../../../../../../config/constants';

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
        } catch (err) {
            setEvents([]);
            setLoading(false);
        }
    }, [params.podName, params.nodeType]);

    return (
        <div style={{ minHeight: '600px', background: '#0B0F22', flex: 1 }}>
            {isDeleted ? (
                <div>
                    <MessageUI msg={MESSAGING_UI.NO_RESOURCE} size={32} />
                </div>
            ) : (
                pods &&
                pods.length > 0 && (
                    <EventsTable loading={loading} eventsList={events} />
                )
            )}
            {pods.length === 0 && <MessageUI msg={MESSAGING_UI.NO_EVENTS} size={24} />}
        </div>
    );
}

export default EventsComponent;
