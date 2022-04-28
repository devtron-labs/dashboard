import React, { useEffect, useState } from 'react';
import IndexStore from '../../index.store';
import { getNodeStatus } from './nodeType.util';
import './nodeType.scss';
import { iNode } from '../../appDetails.type';

function PodHeaderComponent({ callBack }) {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new');
    const podMetaData = IndexStore.getPodMetaData()
    const newPodStats = { running: 0, all: 0 }
    const oldPodStats = { running: 0, all: 0 }
    const [newPods, setNewPods] = useState(newPodStats)
    const [oldPods, setOldPods] = useState(oldPodStats)
    const pods: Array<iNode> = IndexStore.getiNodesByKind('pod')

    useEffect(() => {
        if (podMetaData && podMetaData.length > 0) {
            pods.forEach((pod) => {
                let podStatusLower = getNodeStatus(pod)?.toLowerCase()
                if (podMetaData.find((f) => f.name === pod.name)?.isNew) {
                    newPodStats[podStatusLower] = (newPodStats[podStatusLower] || 0) + 1
                    newPodStats['all'] += 1
                } else {
                    oldPodStats[podStatusLower] = (oldPodStats[podStatusLower] || 0) + 1
                    oldPodStats['all'] += 1
                }
            })
        }
    }, [podMetaData,pods]);

    useEffect(() => {
        callBack(podTab === 'new');
        setNewPods(newPodStats);
        setOldPods(oldPodStats);
    }, [podTab]);

    return (
        <div className="pod-node-tab__wrapper flex left">
            <div
                className={`lh-1-4-33 no-decor pod-tab ${
                    podTab === 'new' ? 'pod-tab__active' : ''
                } border-right flex left column pl-16 pr-16 pointer `}
                onClick={(e) => selectPodTab('new')}
                data-testid="all-pods-new"
            >
                <div className="fs-14 fw-6 pt-12 ">New Pods ({newPods.all}) </div>
                <div className="flex left fs-12 cn-9 pb-12">
                    {Object.keys(newPods)
                        .filter((n) => n !== 'all')
                        .map((status, idx) => (
                            <React.Fragment key={idx}>
                                {!!idx && <span className="bullet mr-4 ml-4"></span>}
                                <span key={idx} data-testid={`new-pod-status-${status}`}>
                                    {newPods[status]} {status}
                                </span>
                            </React.Fragment>
                        ))}
                </div>
            </div>
            <div
                className={`pod-tab ${
                    podTab === 'old' ? 'pod-tab__active border-right' : 'pod-tab__transparent-top'
                } no-decor flex left column pl-16 pr-16 pointer  `}
                onClick={(e) => selectPodTab('old')}
                data-testid="all-pods-old"
            >
                <div className="fs-14 fw-6 pt-12">Old Pods ({oldPods.all})</div>
                <div className="flex left fs-12 cn-9 pb-12 ">
                    {Object.keys(oldPods)
                        .filter((n) => n !== 'all')
                        .map((status, idx) => (
                            <React.Fragment key={idx}>
                                {!!idx && <span className="bullet mr-4 ml-4"></span>}
                                <span key={idx}>
                                    {oldPods[status]} {status}
                                </span>
                            </React.Fragment>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default PodHeaderComponent;
