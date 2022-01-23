import React, { useEffect, useState } from 'react';
import IndexStore from '../../index.store';
import './nodeType.scss';

function PodHeaderComponent({ callBack }) {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new');

    const podMetaData = IndexStore.getPodMetaData();
    const [newPods, setNewPods] = useState([]);
    const [oldPods, setOldPods] = useState([]);
    const [selectedHealthyNewNodeCount, setSelectedHealthyNewNodeCount] = useState<Number>(0);
    const [selectedHealthyOldNodeCount, setSelectedHealthyOldNodeCount] = useState<Number>(0);

    useEffect(() => {
        if (podMetaData && podMetaData.length > 0) {
            let _newPods = [];
            let _oldPods = [];

            podMetaData.forEach((pod) => {
                if (pod.isNew) {
                    _newPods.push(pod);
                } else {
                    _oldPods.push(pod);
                }
            });
            setNewPods(_newPods);
            setOldPods(_oldPods);

            setSelectedHealthyNewNodeCount(_newPods.length);
            setSelectedHealthyOldNodeCount(_oldPods.length);
        }
    }, [podMetaData?.length]);

    useEffect(() => {
        callBack(podTab === 'new');
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
                <div className="fs-14 fw-6 pt-12 ">New Pods ({newPods.length})</div>
                <div className="flex left fs-12 cn-9 pb-12">
                    <React.Fragment>
                        {selectedHealthyNewNodeCount > 0 ? (
                            <div className="pl-16"> {selectedHealthyNewNodeCount} healthy</div>
                        ) : (
                            ''
                        )}

                        {/* {<span className="bullet mr-4 ml-4"></span>} */}
                        {/* <span data-testid={`new-pod-status`}> 8 running • 3 failed • 5 pending • 4 succeeded </span> */}
                    </React.Fragment>
                </div>
            </div>
            <div
                className={`pod-tab ${
                    podTab === 'old' ? 'pod-tab__active border-right' : 'pod-tab__transparent-top'
                } no-decor flex left column pl-16 pr-16 pointer  `}
                onClick={(e) => selectPodTab('old')}
                data-testid="all-pods-old"
            >
                <div className="fs-14 fw-6 pt-12">Old Pods ({oldPods.length})</div>
                <div className="flex left fs-12 cn-9 pb-12 ">
                    <React.Fragment>
                        {selectedHealthyOldNodeCount > 0 ? (
                            <div className="pl-16"> {selectedHealthyOldNodeCount} healthy</div>
                        ) : (
                            ''
                        )}
                    </React.Fragment>
                </div>
            </div>
        </div>
    );
}

export default PodHeaderComponent;
