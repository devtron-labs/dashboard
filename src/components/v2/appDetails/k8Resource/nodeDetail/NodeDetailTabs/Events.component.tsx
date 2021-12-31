import React, { useEffect, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router';
import IndexStore from '../../../index.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';
import moment from 'moment';
import { NodeType } from '../../../appDetails.type';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';


function EventsComponent({ selectedTab }) {

    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const { url } = useRouteMatch()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const appDetails = IndexStore.getAppDetails();
    const [podName, setPodName] = useState(params.podName)
    const pods = IndexStore.getNodesByKind(NodeType.Pod)

    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS, url)

        if (!appDetails) {
            //Refresh case -- need to sent to k8 , histrory push
        }

    }, [params.podName])

    useEffect(() => {
        setLoading(true)

        getEvent(appDetails, params.podName).then((response) => {
            setEvents(response.result.items || [])
            setLoading(false)
        }).catch((err) => {
            console.log("err", err)
            setEvents([])
            setLoading(false)
        })
    }, [podName])



    return (
        <div className='bcn-0'>
            {pods && pods.length > 0 &&
                <React.Fragment>
                    {!loading && events && events.length > 0 &&
                        <div className="cn-9" >
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['reason', 'message', 'count', 'last timestamp'].map((head, idx) => {
                                            return <th key={`eh_${idx}`}>{head}</th>
                                        })}
                                    </tr>
                                </thead>
                                <tbody>

                                    {events.map((event, index) => {
                                        return (
                                            <tr key={`eb_${index}`}>
                                                <td>{event.reason}</td>
                                                <td>{event.message}</td>
                                                <td>{event.count}</td>
                                                <td>{moment(event.lastTimestamp, 'YYYY-MM-DDTHH:mm:ss').add(5, 'hours').add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    }

                    {(!loading && (!events || events.length === 0)) && <MessageUI msg='Events not available' />}

                    {loading && <MessageUI msg='fetching events' icon={MsgUIType.LOADING} />}
                </React.Fragment>
            }

            {(pods.length === 0) && <MessageUI msg='Events not available' />}
        </div>
    )
}

export default EventsComponent
