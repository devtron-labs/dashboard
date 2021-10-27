import React, { useState } from 'react'
import { iNode, iNodeType } from './node.type'
import NodeTreeComponent from './NodeTree.component'
import ServiceComponent from './nodeType/Service.component'
import GenericNodeComponent from './nodeType/GenericNode.component'
import PodsComponent from './nodeType/Pod.component'

export default function K8ResourceComponent() {


    const [selectedNode, setSelectedNode] = useState({})


    const updateNodeInfoCB = (node: iNode) => {
        console.log("selected node is", node)
        setSelectedNode(node)
    }

    const selectedNodeData = () => {
        switch (selectedNode["nodeType"]) {
            case "Pod":
                return <PodsComponent/>
            case "Service":
                return <ServiceComponent />
            case "Generic":
                return <GenericNodeComponent />
            default:
                return <div>{selectedNode["name"]}</div>
        }
    }

    return (
        <div className="pl-20 pr-20 bcn-0">
            <div className="pt-16 pb-16">Filters</div>
            <div className="flex left" >
                <div style={{ width: "240px", height: "700px", borderRight: "1px solid #ddd" }} className="">
                    <NodeTreeComponent updateNodeInfo={updateNodeInfoCB} />
                </div>
                <div>
                    {selectedNode && selectedNodeData()}
                </div>
            </div>
        </div>
    )
}
