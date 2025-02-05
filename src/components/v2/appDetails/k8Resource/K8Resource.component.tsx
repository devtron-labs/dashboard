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
import { useHistory, useLocation, useParams } from 'react-router-dom'
import {
    AppType,
    getPodsRootParentNameAndStatus,
    Node,
    StatusFilterButtonComponent,
    useMainContext,
    useSearchString,
    ALL_RESOURCE_KIND_FILTER,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as K8ResourceIcon } from '@Icons/ic-object.svg'
import { ReactComponent as Info } from '@Icons/ic-info-outline.svg'
import { useSharedState } from '@Components/v2/utils/useSharedState'
import { URLS } from '@Config/routes'
import IndexStore from '../index.store'
import { AppDetailsTabs } from '../appDetails.store'
import { K8ResourceComponentProps } from '../appDetails.type'
import NodeTreeComponent from './nodeType/NodeTree.component'
import NodeComponent from './nodeType/Node.component'
import './k8resources.scss'
import { doesNodeSatisfiesFilter } from './utils'

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
    const currentNode = useParams<{ nodeType: string }>().nodeType
    const currentFilter = useSearchString().searchParams.filterType || ALL_RESOURCE_KIND_FILTER
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const { isSuperAdmin } = useMainContext()
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
        const appDetails = IndexStore.getAppDetails()
        const nodeKind = newNode.kind.toLowerCase()
        const newKind = nodeKind === 'pod' ? `pod/group/${getPodNameForSelectedFilter(selectedFilter)}` : nodeKind
        switch (appDetails.appType) {
            case AppType.DEVTRON_HELM_CHART:
                return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${appDetails.installedAppId}/env/${appDetails.environmentId}/details/${URLS.APP_DETAILS_K8}/${newKind}`
            case AppType.EXTERNAL_HELM_CHART:
                return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${appDetails.appId}/${appDetails.appName}/details/${URLS.APP_DETAILS_K8}/${newKind}`
            case AppType.EXTERNAL_ARGO_APP:
                return `${URLS.APP}/${URLS.EXTERNAL_ARGO_APP}/${appDetails.clusterId}/${appDetails.appName}/${appDetails.namespace}/details/${URLS.APP_DETAILS_K8}/${newKind}`
            case AppType.EXTERNAL_FLUX_APP:
                return `${URLS.APP}/${URLS.EXTERNAL_FLUX_APP}/${appDetails.clusterId}/${appDetails.appName}/${appDetails.namespace}/${appDetails.fluxTemplateType}/details/${URLS.APP_DETAILS_K8}/${newKind}`
            default:
                return `${URLS.APP}/${appDetails.appId}/details/${appDetails.environmentId}/${URLS.APP_DETAILS_K8}/${nodeKind}`
        }
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
        <div className="bg__primary flexbox flex-grow-1" style={{ justifyContent: 'space-between' }}>
            {nodes.length > 0 ? (
                <div
                    className={`flex-grow-1 flexbox ${isSuperAdmin ? 'pb-28' : ''}`}
                    data-testid="resource-node-wrapper"
                >
                    <div className="k8-resources-node-tree dc__border-right--n1" data-testid="k8-resources-node-tree">
                        <div className="pt-16 pb-15 px-16 border__secondary--bottom">
                            <StatusFilterButtonComponent
                                nodes={nodes}
                                selectedTab={currentFilter}
                                handleFilterClick={handleFilterClick}
                                maxInlineFiltersCount={3}
                            />
                        </div>
                        <div className="py-8 px-12">
                            <NodeTreeComponent
                                clickedNodes={clickedNodes}
                                registerNodeClick={registerNodeClick}
                                isDevtronApp={isDevtronApp}
                            />
                        </div>
                    </div>
                    <div className="flex-grow-1-imp p-0" data-testid="k8-resources-node-details">
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

export const EmptyK8sResourceComponent = ({ emptyStateMessage }: { emptyStateMessage: string }) => (
    <>
        <div
            data-testid="resource-tree-wrapper"
            className="resource-tree-wrapper flexbox pl-20 pr-20"
            style={{ outline: 'none' }}
        >
            <ul className="tab-list">
                <li className="flex left dc__ellipsis-right">
                    <div className="flex">
                        <div className="resource-tree-tab bg__primary cn-9 left pl-12 pt-8 pb-8 pr-12">
                            <div className="resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 dc__no-decor m-0-imp">
                                <div className="flex left cn-9">
                                    <span className="icon-dim-16 resource-tree__tab-hover fcn-9">
                                        <K8ResourceIcon />
                                    </span>
                                    <span className="ml-8 dc__capitalize fs-12">{AppDetailsTabs.k8s_Resources}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div className="bg__primary flex h-100">
            <div className="flex column h-100">
                <Info className="icon-dim-20 icon-n5" />
                <span className="mt-10">{emptyStateMessage}</span>
            </div>
        </div>
    </>
)
