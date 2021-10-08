import React, { useState } from 'react';
import {useParams} from 'react-router';
import { FragmentHOC } from '../../../../../../common';
import { ReactComponent as Object } from '../../../../assets/icons/ic-object.svg';
import {NodeDetailTabs} from './eventsLogsTabs.types';

export default function EventsLogsTabsModal() {
    return (
        <div className=" mt-16 ">
            <ResourceTreeTabs />
        </div>
    )
}

export function ResourceTreeTabs() {
    const [showTabDetails, setShowTabDetails] = useState(false)

    function toggleShowDetail() {
        setShowTabDetails(!showTabDetails)
    }

    return <div>
        <div className=" flex left ">
            <div className="fs-13 w-200 cn-9 fw-6 br-8 pt-8 pb-8 pl-24 pr-16 cursor flex left mr-8"><Object /> K8s Resources</div>
            <div onClick={toggleShowDetail} className="fs-13 bcn-0 w-200 en-2 bw-1 cn-9 fw-6 br-8 pt-8 pb-8 pl-16 pr-16 cursor">pod/...5-nh4v5(new)</div>
        </div>
        {showTabDetails && <div className="bcn-0">
            <EventsLogsTabSelector />
        </div>
        }
    </div>
}

export function EventsLogsTabSelector() {
    const params = useParams<{ appId: string; envId: string; tab?: NodeDetailTabs; kind?: NodeDetailTabs }>();
console.log(params)
    return (<FragmentHOC style={{ background: '#2c3354', boxShadow: 'inset 0 -1px 0 0 #0b0f22' }}>
        <div>

        </div>
        <div>

        </div>
    </FragmentHOC>)
}