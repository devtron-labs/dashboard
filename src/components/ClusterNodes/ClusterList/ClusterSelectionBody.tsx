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

import React, { useRef, useState } from 'react'

import {
    BulkSelectionEvents,
    BulkSelectionIdentifiersType,
    ClusterDetail,
    ClusterFiltersType,
    GenericEmptyState,
    useBulkSelection,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import NoClusterEmptyState from '@Images/no-cluster-empty-state.png'
import { importComponentFromFELibrary } from '@Components/common'
import { AddClusterButton } from '@Components/ResourceBrowser/PageHeader.buttons'

import ClusterNodeEmptyState from '../ClusterNodeEmptyStates'
import { ClusterMapListSortableKeys } from '../constants'
import { parseSearchParams } from '../utils'
import ClusterList from './ClusterList'
import { ClusterSelectionBodyTypes } from './types'

import '../clusterNodes.scss'

const ClusterMap = importComponentFromFELibrary('ClusterMap', null, 'function')
const ClusterBulkSelectionActionWidget = importComponentFromFELibrary(
    'ClusterBulkSelectionActionWidget',
    null,
    'function',
)
const KubeConfigModal = importComponentFromFELibrary('KubeConfigModal', null, 'function')

const ClusterSelectionBody: React.FC<ClusterSelectionBodyTypes> = ({
    clusterOptions,
    clusterListLoader,
    filteredList,
}) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const [showKubeConfigModal, setShowKubeConfigModal] = useState(false)
    const [selectedClusterName, setSelectedClusterName] = useState('')

    const { clearFilters } = useUrlFilters<ClusterMapListSortableKeys, { clusterFilter: ClusterFiltersType }>({
        parseSearchParams,
        initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
    })

    const { handleBulkSelection, getSelectedIdentifiersCount } =
        useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()

    const identifierCount = getSelectedIdentifiersCount()

    const handleClearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    if (!clusterOptions.length) {
        return (
            <GenericEmptyState
                image={NoClusterEmptyState}
                title="No clusters found"
                subTitle="Add a cluster to view and debug Kubernetes resources in the cluster"
                renderButton={AddClusterButton}
            />
        )
    }

    const onChangeShowKubeConfigModal = () => {
        setShowKubeConfigModal(true)
    }

    const onChangeCloseKubeConfigModal = () => {
        setShowKubeConfigModal(false)
        setSelectedClusterName('')
    }

    const renderClusterList = () => (
        <div className="cluster-list-main-container flex-grow-1 flexbox-col bg__primary dc__overflow-auto">
            {ClusterMap && window._env_.FEATURE_CLUSTER_MAP_ENABLE && (
                <ClusterMap
                    isLoading={clusterListLoader}
                    filteredList={filteredList}
                    clusterListLoader={clusterListLoader}
                    isProportional
                />
            )}
            {!filteredList?.length ? (
                <div className="flex-grow-1">
                    <ClusterNodeEmptyState actionHandler={clearFilters} />
                </div>
            ) : (
                <ClusterList
                    filteredList={filteredList}
                    clusterListLoader={clusterListLoader}
                    setSelectedClusterName={setSelectedClusterName}
                    showKubeConfigModal={showKubeConfigModal}
                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                />
            )}
        </div>
    )

    const renderClusterBulkSelection = () => {
        if (identifierCount > 0) {
            return (
                <ClusterBulkSelectionActionWidget
                    parentRef={parentRef}
                    count={identifierCount}
                    handleClearBulkSelection={handleClearBulkSelection}
                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                />
            )
        }
        return null
    }

    return (
        <div ref={parentRef} className="flexbox-col flex-grow-1">
            {renderClusterBulkSelection()}
            {renderClusterList()}
            {showKubeConfigModal && KubeConfigModal && (
                <KubeConfigModal
                    clusterName={selectedClusterName || identifierCount === 0}
                    handleModalClose={onChangeCloseKubeConfigModal}
                    isSingleClusterButton={!!selectedClusterName}
                />
            )}
        </div>
    )
}

export default ClusterSelectionBody
