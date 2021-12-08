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
            { value: "Pulled", className:"table__padding-left pr-20 mono" },
            { value: "Container image docker.elastic.co/elasticsearch/elasticsearch:7.9.1 already present on machine" , className: "mono"},
            { value: "0" , className: "mono"},
            { value: "Wed, 19 Jun 2019, 16:02 PM", className: "mono" },
        ],
        [
            { value: "Back off", className:"table__padding-left pr-20 mono" },
            { value: "Back-off restarting failed container", className: "mono" },
            { value: "0", className: "mono" },
            { value: "Wed, 19 Jun 2019, 16:02 PM", className: "mono" },
        ],
        [
            { value: "FailedGetResourceMetric", className:" table__padding-left pr-20 mono" },
            { value: "missing request for memory", className: "mono" },
            { value: "0" , className: "mono"},
            { value: "Wed, 19 Jun 2019, 16:02 PM", className: "mono" },
        ]
    ]
}

function EventsComponent({selectedTab}) {

    const params = useParams<{ actionName: string, podName: string, nodeType: string  }>()
    const { path, url } = useRouteMatch()
    
    useEffect(() => {
        selectedTab(NodeDetailTab.EVENTS)

        if (params.podName) {
            AppDetailsStore.addAppDetailsTab(params.nodeType, params.podName, url)
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
            <TableUtil table={EventTableJSON}/>
        </div>
    )
}

export default EventsComponent
