import React, { useEffect } from 'react'
import NodeTreeComponent from './nodeType/NodeTree.component'
import FilterResource from './FilterResource'
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store'
import NodeComponent from './nodeType/Node.component'
import { useSharedState } from '../../utils/useSharedState'
import IndexStore from '../index.store'
import { K8ResourceComponentProps } from '../appDetails.type'
import { ReactComponent as K8ResourceIcon } from '../../../../assets/icons/ic-object.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-outline.svg'
import './k8resources.scss'

export default function K8ResourceComponent({
    clickedNodes,
    registerNodeClick,
    handleFocusTabs,
    externalLinks,
    monitoringTools,
    isDevtronApp,
}: K8ResourceComponentProps) {
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.k8s_Resources)
    }, [])

    return (
        <div className="bcn-0" style={{ justifyContent: 'space-between' }}>
            <div className="pt-16 pl-20 pb-8">
                <FilterResource nodes={nodes} />
            </div>
            {nodes.length > 0 ? (
                <div className="resource-node-wrapper flexbox" data-testid="resource-node-wrapper">
                    <div className="k8-resources-node-tree pt-8 pl-16 dc__border-right" data-testid="k8-resources-node-tree">
                        <NodeTreeComponent
                            clickedNodes={clickedNodes}
                            registerNodeClick={registerNodeClick}
                            isDevtronApp={isDevtronApp}
                        />
                    </div>
                    <div className="flex-grow-1-imp dc__overflow-y-auto p-0" data-testid="k8-resources-node-details">
                        <NodeComponent
                            handleFocusTabs={handleFocusTabs}
                            externalLinks={externalLinks}
                            monitoringTools={monitoringTools}
                            isDevtronApp={isDevtronApp}
                        />
                    </div>
                </div>
            ) : (
                <div>Empty UI</div>
            )}
        </div>
    )
}

export function EmptyK8sResourceComponent({ emptyStateMessage }: { emptyStateMessage: string }) {
    return (
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
                                        <span className="ml-8 dc__capitalize fs-12">
                                            {AppDetailsTabs.k8s_Resources}
                                        </span>
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
}