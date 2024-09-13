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

import { useEffect } from 'react'

import { StatusFilterButtonComponent, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as K8ResourceIcon } from '@Icons/ic-object.svg'
import { ReactComponent as Info } from '@Icons/ic-info-outline.svg'
import { useSharedState } from '@Components/v2/utils/useSharedState'

import IndexStore from '../index.store'
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store'
import { K8ResourceComponentProps } from '../appDetails.type'
import NodeTreeComponent from './nodeType/NodeTree.component'
import NodeComponent from './nodeType/Node.component'

import './k8resources.scss'

export const K8ResourceComponent = ({
    clickedNodes,
    registerNodeClick,
    handleFocusTabs,
    externalLinks,
    monitoringTools,
    isDevtronApp,
    clusterId,
    isDeploymentBlocked,
    isExternalApp,
}: K8ResourceComponentProps) => {
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const { isSuperAdmin } = useMainContext()
    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.k8s_Resources)
    }, [])

    return (
        <div className="bcn-0" style={{ justifyContent: 'space-between' }}>
            {nodes.length > 0 ? (
                <div
                    className={`resource-node-wrapper flexbox ${isSuperAdmin ? 'pb-28' : ''}`}
                    data-testid="resource-node-wrapper"
                >
                    <div className="k8-resources-node-tree p-8 dc__border-right" data-testid="k8-resources-node-tree">
                        <div className="flexbox mb-8 px-12">
                            <StatusFilterButtonComponent nodes={nodes} />
                        </div>
                        <NodeTreeComponent
                            clickedNodes={clickedNodes}
                            registerNodeClick={registerNodeClick}
                            isDevtronApp={isDevtronApp}
                        />
                    </div>
                    <div className="flex-grow-1-imp p-0" data-testid="k8-resources-node-details">
                        <NodeComponent
                            handleFocusTabs={handleFocusTabs}
                            externalLinks={externalLinks}
                            monitoringTools={monitoringTools}
                            isDevtronApp={isDevtronApp}
                            clusterId={clusterId}
                            isDeploymentBlocked={isDeploymentBlocked}
                            isExternalApp={isExternalApp}
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
                        <div className="resource-tree-tab bcn-0 cn-9 left pl-12 pt-8 pb-8 pr-12">
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
        <div className="bcn-0 flex h-100">
            <div className="flex column h-100">
                <Info className="icon-dim-20 icon-n5" />
                <span className="mt-10">{emptyStateMessage}</span>
            </div>
        </div>
    </>
)
