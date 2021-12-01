import React, { useEffect, useState } from 'react'
import TableUtil from '../../../../utils/tableUtils/Table.util'
import { useParams, useRouteMatch, useHistory } from 'react-router';
import IndexStore from '../../../index.store';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getEvent } from '../nodeDetail.api';


const EventTableJSON = {
    tHead: [
        { value: "Reason", className:"table__padding-left pr-20" },
        { value: "Message" },
        { value: "Count" },
        { value: "Last Time stamp" },
    ],
    tBody: [
        [
            { value: "Pulled", className:"table__padding-left pr-20" },
            { value: "Container image docker.elastic.co/elasticsearch/elasticsearch:7.9.1 already present on machine" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "Back off", className:"table__padding-left pr-20" },
            { value: "Back-off restarting failed container" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "FailedGetResourceMetric", className:" table__padding-left pr-20" },
            { value: "missing request for memory" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ]
    ]
}

function EventsComponent({selectedTab}) {

    const params = useParams<{ actionName: string, podName: string, nodeType: string  }>()
    const { path, url } = useRouteMatch()
    const [event, setEvent] = useState("...");
    
    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS)

        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.nodeType, params.podName, url)
        }

        const appDetails = IndexStore.getAppDetails();

        getEvent(appDetails, params.podName).then((response) => {
            console.log("response", response);
            //setEvent(response.result.manifest)
        }).catch((err) => {
            console.log("err", err)
        })

    }, [params.podName])

    useEffect(() => {
        if(params.actionName){
            AppDetailsStore.setCurrentTab(params.actionName)
        }
    }, [params.actionName])

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.EVENTS)
    // }, [])

    return (
        <div className="bcn-0" >
            <TableUtil table={EventTableJSON} bodyFont="SourceCodePro"/>
        </div>
    )
}

export default EventsComponent
