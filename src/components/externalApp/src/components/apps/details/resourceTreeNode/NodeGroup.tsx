import React, { useState } from 'react'
import { ReactComponent as DropDown } from '../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as ErrorImage } from '../../../assets/icons/errorInfo.svg';
import { useHistory, useLocation, useRouteMatch, useParams, generatePath } from 'react-router';
import { NavLink } from 'react-router-dom';

export default function NodeGroup() {
    const history = useHistory()
    const [collapsedWorkload, setCollapsedWorkload] = useState(false)
    const [collapsedReplicaset, setCollapsedReplicaset] = useState(false)
    const [collapsedPod, setCollapsedPod] = useState(false)

    const onClickWorkloadKind = () => {
        let link = `Workload`
        history.push(link);
        setCollapsedWorkload(!collapsedWorkload)
    }

    const onClickPodKind = () => {
        let link = `Pod`
        history.push(link);
        setCollapsedPod(!collapsedPod);
    }

    const onClickReplicaSetKind = () => {
        let link = `ReplicaSet`
        history.push(link);
        setCollapsedReplicaset(!collapsedReplicaset);
    }

    return (
        <>
            <>
                <DropDown
                    onClick={(e) => setCollapsedWorkload(!collapsedWorkload)}
                    className={`rotate icon-dim-24 pointer ${!collapsedWorkload ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsedWorkload ? '-90deg' : '0deg' }}
                />
                <div
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div onClick={onClickWorkloadKind}> Workload</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
            <>
                <DropDown
                    // onClick={(e) => setCollapsedReplicaset(!collapsedReplicaset)}
                    className={`rotate icon-dim-24 pointer ${!collapsedReplicaset ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsedReplicaset ? '-90deg' : '0deg' }}
                />
                <div
                    onClick={(e) => onClickReplicaSetKind()}
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div> Replica Set</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
            <>
                <DropDown
                    onClick={(e) => setCollapsedPod(!collapsedPod)}
                    className={`rotate icon-dim-24 pointer ${!collapsedPod ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsedPod ? '-90deg' : '0deg' }}
                />
                <div
                    onClick={onClickPodKind}
                    //  onClick={(e) => setCollapsed(not)} 
                    className="fs-14 pointer w-100 fw-6 flex left pl-8">
                    <div> Pods</div>
                    {/* <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        /> */}
                </div>
            </>
        </>
    )
}
