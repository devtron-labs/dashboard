import React, { useEffect, useState } from 'react';
import IndexStore from '../../index.store';
import { getNodeStatus } from './nodeType.util';
import './nodeType.scss';
import { iNode } from '../../appDetails.type';

function PodHeaderComponent({ callBack }) {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new');
    const podMetaData = IndexStore.getPodMetaData()
    const pods: Array<iNode> = IndexStore.getiNodesByKind('pod')
    const newPodStats = { running: 0, all: 0 }
    const oldPodStats = { running: 0, all: 0 }
    const [newPods, setNewPods] = useState(newPodStats)
    const [oldPods, setOldPods] = useState(oldPodStats)

    useEffect(() => {
        if (pods && podMetaData && podMetaData.length > 0) {
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
            <TabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={newPods} isNew={true} />
            <TabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={oldPods} isNew={false} />
        </div>
    )
}

function TabSection({
    podTab,
    selectPodTab,
    podStatus,
    isNew,
}: {
    podTab: string
    selectPodTab: (string) => void
    podStatus: { running; all }
    isNew: boolean
}) {
    const dataTestId = isNew ? 'all-pods-new' : 'all-pods-old'
    return (
        <div
            className={
                isNew
                    ? `lh-1-4-33 no-decor pod-tab ${
                          podTab === 'new' ? 'pod-tab__active' : ''
                      } border-right flex left column pl-16 pr-16 pointer `
                    : `pod-tab ${
                          podTab === 'old' ? 'pod-tab__active border-right' : 'pod-tab__transparent-top'
                      } no-decor flex left column pl-16 pr-16 pointer  `
            }
            onClick={(e) => selectPodTab(isNew ? 'new' : 'old')}
            data-testid={dataTestId}
        >
            <div className="fs-14 fw-6 pt-12 ">
                {' '}
                {isNew ? 'New Pods' : 'Old Pods'} ({podStatus.all}){' '}
            </div>
            <div className="flex left fs-12 cn-9 pb-12">
                {Object.keys(podStatus)
                    .filter((n) => n !== 'all')
                    .map((status, idx) => (
                        <React.Fragment key={idx}>
                            {!!idx && <span className="bullet mr-4 ml-4"></span>}
                            <span key={idx} data-testid={isNew && `new-pod-status-${status}`}>
                                {podStatus[status]} {status}
                            </span>
                        </React.Fragment>
                    ))}
            </div>
        </div>
    )
}

export default PodHeaderComponent;
