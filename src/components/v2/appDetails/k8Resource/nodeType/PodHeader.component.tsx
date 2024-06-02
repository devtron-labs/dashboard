/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from 'react'
import IndexStore from '../../index.store'
import { getNodeStatus } from './nodeType.util'
import './nodeType.scss'
import { iNode } from '../../appDetails.type'
import PodTabSection from './PodTabSection'
import { useSharedState } from '../../../utils/useSharedState'

const PodHeaderComponent = ({ callBack }) => {
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new')
    const podMetaData = IndexStore.getPodMetaData()
    const pods: Array<iNode> = IndexStore.getiNodesByKind('pod')
    const [newPods, setNewPods] = useState({ running: 0, all: 0 })
    const [oldPods, setOldPods] = useState({ running: 0, all: 0 })
    const [filteredNodes] = useSharedState(
        IndexStore.getAppDetailsFilteredNodes(),
        IndexStore.getAppDetailsNodesFilteredObservable(),
    )

    useEffect(() => {
        callBack(podTab === 'new')
        // initialize new pods and old pods
        const newPodStats = { running: 0, all: 0 }
        const oldPodStats = { running: 0, all: 0 }

        // calculate new pods and old pods
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

        // update new pods and old pods state
        setNewPods({ ...newPodStats })
        setOldPods({ ...oldPodStats })
    }, [filteredNodes, podTab])

    return (
        <div className="pod-node-tab__wrapper flex left">
            <PodTabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={newPods} isNew />
            <PodTabSection podTab={podTab} selectPodTab={selectPodTab} podStatus={oldPods} isNew={false} />
        </div>
    )
}

export default PodHeaderComponent
