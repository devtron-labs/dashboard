import React, { useEffect } from 'react'
import NodeTreeComponent from './nodeType/NodeTree.component'
import FilterResource from './FilterResource'
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store'
import NodeComponent from './nodeType/Node.component'
import { useSharedState } from '../../utils/useSharedState'
import IndexStore from '../index.store'
import { K8ResourceComponentProps } from '../appDetails.type'
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
