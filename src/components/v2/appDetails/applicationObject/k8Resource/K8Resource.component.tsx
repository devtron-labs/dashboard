import React, { useState } from 'react'
import { iNode, iNodeType } from './node.type'
import NodeTreeComponent from './NodeTree.component'
import ServiceComponent from './nodeType/Service.component'
import AllPodsComponent from './nodeType/AllPods.component'
import FilterResource from './FilterResource'
import GenericInfoComponent from './nodeType/GenericInfo.component'

export default function K8ResourceComponent(props) {
    const [selectedNode, setSelectedNode] = useState<iNode | undefined>(undefined)
    const updateNodeInfoCB = (node: iNode) => {
        console.log("selected node is", node)
        setSelectedNode(node)
    }

    const selectedNodeData = () => {
        console.log(selectedNode.type)
        switch (selectedNode.type) {
            case iNodeType.AllPod:
                return <AllPodsComponent
                    selectedNode={selectedNode}
                    addResourceTabClick={props.addResourceTabClick}
                />
            case iNodeType.Service:
                return <ServiceComponent
                    selectedNode={selectedNode}
                    addResourceTabClick={props.addResourceTabClick}

                />
            case iNodeType.GenericInfo:
                return <GenericInfoComponent
                    selectedNode={selectedNode}
                    addResourceTabClick={props.addResourceTabClick}

                />
            default:
                return (
                    <div>
                        {selectedNode["name"]}
                    </div>
                )
        }

    }

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16"><FilterResource /></div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-2" style={{
                        maxHeight: '500px',
                        height: '500px',
                        overflowY: 'auto',
                        borderRight: '1px solid var(--N200)',
                    }}> <NodeTreeComponent updateNodeInfo={updateNodeInfoCB} /></div>
                    <div className="col"> {selectedNode && selectedNodeData()}</div>
                </div>
            </div>
        </div>
    )
}
