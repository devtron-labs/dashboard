import React, { useEffect, useState } from 'react'
import { useParams, useRouteMatch, useHistory } from 'react-router';
import IndexStore from '../../../index.store';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';
import { Pod as PodIcon} from '../../../../../common';
import moment from 'moment';
import { Spinner } from 'patternfly-react';
import InfoIcon from '../../../../assets/icons/ic-info-filled.svg'


function EventsComponent({ selectedTab }) {

    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const [eventsResult, setEventResult] = useState(undefined)
    const events = eventsResult?.items || []
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS)
        const appDetails = IndexStore.getAppDetails();
        getEvent(appDetails, params.podName).then((response) => {
            setEventResult(response.result)
        }).catch((err) => {
            console.log("err", err)
        })

    }, [params.podName])


     const NoPod = ({ selectMessage = "Select a pod to view events", style = {} })  => {
        return <div data-testid="no-pod" className="no-pod no-pod--pod" style={{ ...style }}>
            <PodIcon color="var(--N400)" style={{ width: '48px', height: '48px', marginBottom: '12px' }} />
            <p>{selectMessage}</p>
        </div>
    }

    const NoEvents = ({ title = "Events not available" }) => {
        return (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <img src={InfoIcon} />
                <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>{title}</div>
            </div>
        )
    }
    
    return (
        <div className="bcn-0 flex" style={{ width: '100%', textAlign: 'center', minHeight: '600px' }} >
            { events.filter(event => event).length > 0 && <div className="events-logs__events-table">

                <div className="events-logs__events-table-row header m-0">
                    {['reason', 'message', 'count', 'last timestamp'].map((head, idx) =>
                        <span className="events-logs__event" key={idx}>{head}</span>)}
                </div>

                {events.ite && events.map((event, index) => <div className="events-logs__events-table-row" key={index}>
                    <span className="events-logs__event">{event.reason}</span>
                    <span className="events-logs__event">{event.message}</span>
                    <span className="events-logs__event">{event.count}</span>
                    <span className="events-logs__event">{moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss').add(5, 'hours').add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>)
                }
            </div>}

            {params.podName && events.filter(event => event).length === 0 && <div className="flex" style={{ height: '100%', width: '100%' }}>
                {loading && <div  className="flex h-100" >
                    <Spinner loading></Spinner>
                    <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>fetching events</div>
                </div>}
                {!loading && events.filter(event => event).length === 0 && <NoEvents />}
            </div>}

            {!params.podName && <NoPod />}
        </div>
    )
}

export default EventsComponent
