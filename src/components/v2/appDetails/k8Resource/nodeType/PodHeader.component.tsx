import React, { useEffect, useState } from 'react';
import IndexStore from '../../index.store';
import { getNodeStatus } from './nodeType.util';
import './nodeType.scss';
import { iNode } from '../../appDetails.type';
import PodTabSection from './PodTabSection';

function PodHeaderComponent({ callBack }) {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new');
    const podMetaData = IndexStore.getPodMetaData()
    const pods: Array<iNode> = IndexStore.getiNodesByKind('pod')
    const newPodStats = { running: 0, all: 0 }
    const oldPodStats = { running: 0, all: 0 }
    const [newPods, setNewPods] = useState(newPodStats)
    const [oldPods, setOldPods] = useState(oldPodStats)

    useEffect(() => {
        if (pods && podMetaData?.length > 0) {
            pods.forEach((pod) => {
                const podStatusLower = getNodeStatus(pod)?.toLowerCase()
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
            <PodTabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={newPods} isNew={true} />
            <PodTabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={oldPods} isNew={false} />
        </div>
    )
}

export default PodHeaderComponent;
