import React, { useEffect } from 'react'
import TableUtil from '../../../../utils/tableUtils/Table.util'
import { useParams, useRouteMatch, useHistory } from 'react-router';
import IndexStore from '../../../index.store';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTabs } from '../../../node.type';


const EventTableJSON = {
    tHead: [
        { value: "Reason", className:"pl-20 pr-20" },
        { value: "Message" },
        { value: "Count" },
        { value: "Last Time stamp" },
    ],
    tBody: [
        [
            { value: "Pulled", className:"pl-20 pr-20" },
            { value: "Container image docker.elastic.co/elasticsearch/elasticsearch:7.9.1 already present on machine" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "Back off", className:"pl-20 pr-20" },
            { value: "Back-off restarting failed container" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "FailedGetResourceMetric", className:"pl-20 pr-20" },
            { value: "missing request for memory" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ]
    ]
}

function EventsComponent({selectedTab}) {

    const params = useParams<{ actionName: string, podName: string }>()
    const { path, url } = useRouteMatch()

    useEffect(() => {
        selectedTab(NodeDetailTabs.EVENTS)

        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.podName, url)
        }
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
