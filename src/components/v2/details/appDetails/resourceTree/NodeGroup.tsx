import React, { useState } from 'react'
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as ErrorImage } from '../../../../../assets/icons/errorInfo.svg';
import { useHistory, useLocation, useRouteMatch, useParams, generatePath } from 'react-router';
import { NavLink } from 'react-router-dom';
import { TabsJSON } from './useResourceTree';

export default function NodeGroup({ addResourceTabCallBack }) {
    const history = useHistory()
    const [collapsedWorkload, setCollapsedWorkload] = useState(true)
    const [collapsedReplicaset, setCollapsedReplicaset] = useState(true)
    const [collapsedPod, setCollapsedPod] = useState(true)

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
                    className="fs-14 pointer w-100 fw-6 pl-8">
                    <div onClick={onClickWorkloadKind}> Workload</div>
                    {!collapsedWorkload &&
                        <div>
                            <div className="no-decor fs-14 cn-9 node-link w-100 flex left pl-8 pr-8" onClick={() => addResourceTabCallBack(TabsJSON['tab 1'])}>Cron Jobs</div>
                            <div className="no-decor fs-14 cn-9 node-link w-100 flex left pl-8 pr-8" onClick={() => addResourceTabCallBack(TabsJSON['tab 1'])}>Daemon Set</div>
                            <div className="no-decor fs-14 cn-9 node-link w-100 flex left pl-8 pr-8" onClick={() => addResourceTabCallBack(TabsJSON['tab 1'])}>Deployment</div>
                            <div className="no-decor fs-14 cn-9 node-link w-100 flex left pl-8 pr-8" onClick={() => addResourceTabCallBack(TabsJSON['tab 1'])}>Jobs</div>
                        </div>
                    }

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
