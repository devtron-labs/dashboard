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

import { useEffect, useMemo } from 'react'
import { generatePath, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    ALL_RESOURCE_KIND_FILTER,
    getPodsRootParentNameAndStatus,
    Node,
    StatusFilterButtonComponent,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Info } from '@Icons/ic-info-outline.svg'
import { ReactComponent as ICObject } from '@Icons/ic-object.svg'
import { DynamicTabs, useTabs } from '@Components/common/DynamicTabs'
import { DynamicTabsVariantType } from '@Components/common/DynamicTabs/types'
import { useSharedState } from '@Components/v2/utils/useSharedState'

import { APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX, AppDetailsTabs, getInitialTabs } from '../appDetails.store'
import { K8ResourceComponentProps } from '../appDetails.type'
import IndexStore from '../index.store'
import NodeComponent from './nodeType/Node.component'
import NodeTreeComponent from './nodeType/NodeTree.component'
import { doesNodeSatisfiesFilter } from './utils'

import './k8resources.scss'

export const K8ResourceComponent = ({
    clickedNodes,
    registerNodeClick,
    externalLinks,
    monitoringTools,
    isDevtronApp,
    clusterId,
    isDeploymentBlocked,
    handleMarkK8sResourceTabSelected,
    addTab,
    removeTabByIdentifier,
    tabs,
    handleUpdateK8sResourceTabUrl,
}: K8ResourceComponentProps) => {
    const history = useHistory()
    const location = useLocation()
    const { path } = useRouteMatch()
    const { nodeType: currentNode, ...restParams } = useParams<{ nodeType: string }>()
    const currentFilter = useSearchString().searchParams.filterType || ALL_RESOURCE_KIND_FILTER
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    useEffect(() => {
        handleMarkK8sResourceTabSelected()
    }, [])

    useEffect(() => {
        IndexStore.updateFilterType(currentFilter.toUpperCase())
    }, [currentFilter, nodes])

    // nodes according to current filter
    const currentFilteredNodes = useMemo(
        () =>
            nodes.filter(
                (node) => currentFilter === ALL_RESOURCE_KIND_FILTER || doesNodeSatisfiesFilter(node, currentFilter),
            ),
        [currentFilter, nodes],
    )

    useEffect(() => {
        // When nodes change and a filter is not present anymore redirect to All
        if (currentFilter === ALL_RESOURCE_KIND_FILTER) {
            return
        }
        if (!currentFilteredNodes.length) {
            history.push({ pathname: location.pathname, search: '' })
        }
    }, [nodes])

    useEffect(() => {
        handleUpdateK8sResourceTabUrl({ url: `${location.pathname}${location.search}` })
    }, [location.pathname, location.search])

    const getPodNameForSelectedFilter = (selectedFilter: string) => {
        const podParents = getPodsRootParentNameAndStatus(nodes)
        const selectNode = podParents.find((parent) => parent[1].toLowerCase() === selectedFilter)?.[0]
        return selectNode?.split('/')?.[2]
    }

    const getRedirectPathname = (newNode: Node, selectedFilter: string) => {
        const nodeKind = newNode.kind.toLowerCase()
        const newKind = nodeKind === 'pod' ? `pod/group/${getPodNameForSelectedFilter(selectedFilter)}` : nodeKind
        return generatePath(path, { ...restParams, nodeType: newKind })
    }

    const handleFilterClick = (selectedFilter: string) => {
        const searchParams = new URLSearchParams([['filterType', selectedFilter]])
        IndexStore.updateFilterType(selectedFilter.toUpperCase())
        if (selectedFilter === ALL_RESOURCE_KIND_FILTER) {
            history.push({ search: '' })
            return
        }
        // current selected node exist in new selected filter or not
        const nextFilterNodes = nodes.filter((node) => doesNodeSatisfiesFilter(node, selectedFilter))
        const selectedNodeExists = nextFilterNodes.some((node) => node.kind.toLowerCase() === currentNode)

        if (!selectedNodeExists) {
            const newNode = nextFilterNodes?.[0]
            history.push({
                pathname: getRedirectPathname(newNode, selectedFilter),
                search: `${searchParams}`,
            })
        } else {
            history.push({ search: `${searchParams}` })
        }
    }

    return (
        <div className="bg__primary flexbox flex-grow-1 dc__overflow-hidden">
            {nodes.length > 0 ? (
                <div className="flex-grow-1 flexbox" data-testid="resource-node-wrapper">
                    <div
                        className="dc__border-right--n1 dc__overflow-hidden flexbox-col dc__no-shrink w-250"
                        data-testid="k8-resources-node-tree"
                    >
                        <div className="pt-16 pb-15 px-16 border__secondary--bottom">
                            <StatusFilterButtonComponent
                                nodes={nodes}
                                selectedTab={currentFilter}
                                handleFilterClick={handleFilterClick}
                                maxInlineFiltersCount={3}
                            />
                        </div>
                        <div className="py-8 px-12 dc__overflow-auto">
                            <NodeTreeComponent
                                clickedNodes={clickedNodes}
                                registerNodeClick={registerNodeClick}
                                isDevtronApp={isDevtronApp}
                            />
                        </div>
                    </div>
                    <div className="flex-grow-1 dc__overflow-auto" data-testid="k8-resources-node-details">
                        <NodeComponent
                            externalLinks={externalLinks}
                            monitoringTools={monitoringTools}
                            isDevtronApp={isDevtronApp}
                            clusterId={clusterId}
                            isDeploymentBlocked={isDeploymentBlocked}
                            addTab={addTab}
                            tabs={tabs}
                            removeTabByIdentifier={removeTabByIdentifier}
                        />
                    </div>
                </div>
            ) : (
                <div>Empty UI</div>
            )}
        </div>
    )
}

export const EmptyK8sResourceComponent = ({ emptyStateMessage }: { emptyStateMessage: string }) => {
    const { url: routeMatchUrl } = useRouteMatch()
    const {
        tabs,
        initTabs,
        markTabActiveById,
        removeTabByIdentifier,
        stopTabByIdentifier,
        // NOTE: fallback to 0th index since that is the k8s_resource tab
    } = useTabs(routeMatchUrl, APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX)

    const location = useLocation()

    useEffect(() => {
        initTabs(getInitialTabs(location.pathname, routeMatchUrl, false), true)
    }, [])

    return (
        <>
            <div className="bg__primary pt-10">
                <DynamicTabs
                    backgroundColorToken="bg__primary"
                    variant={DynamicTabsVariantType.ROUNDED}
                    markTabActiveById={markTabActiveById}
                    removeTabByIdentifier={removeTabByIdentifier}
                    stopTabByIdentifier={stopTabByIdentifier}
                    tabs={tabs}
                    timerConfig={null}
                    iconsConfig={{
                        [AppDetailsTabs.k8s_Resources]: <ICObject className="fcn-7" />,
                    }}
                />
            </div>
            <div className="bg__primary flex h-100">
                <div className="flex column h-100">
                    <Info className="icon-dim-20 icon-n5" />
                    <span className="mt-10">{emptyStateMessage}</span>
                </div>
            </div>
        </>
    )
}
